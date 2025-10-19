import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: any; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('security.bcryptSaltRounds');
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const createUserDto: CreateUserDto = {
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      displayName: `${registerDto.firstName} ${registerDto.lastName}`.trim(),
    };

    const user = await this.usersService.create(createUserDto);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update login stats
    await this.updateLoginStats(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && !loginDto.twoFactorCode) {
      throw new UnauthorizedException('Two-factor authentication code required');
    }

    // Verify 2FA code if provided
    if (user.twoFactorEnabled && loginDto.twoFactorCode) {
      const isValidCode = this.verifyTwoFactorCode(user.twoFactorSecret, loginDto.twoFactorCode);
      if (!isValidCode) {
        throw new UnauthorizedException('Invalid two-factor authentication code');
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update login stats
    await this.updateLoginStats(user.id);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }

    return null;
  }

  async generateTokens(user: any): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    // Store refresh token in database
    await this.prisma.session.create({
      data: {
        sessionToken: refreshToken,
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Check if refresh token exists in database
      const session = await this.prisma.session.findUnique({
        where: { sessionToken: refreshToken },
        include: { user: true },
      });

      if (!session || session.expires < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user);

      // Remove old refresh token
      await this.prisma.session.delete({
        where: { sessionToken: refreshToken },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { sessionToken: refreshToken },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: { userId },
    });
  }

  // Two-Factor Authentication
  async enableTwoFactor(userId: string): Promise<{ qrCode: string; secret: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `DhanAi (${user.email})`,
      issuer: 'DhanAi',
    });

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    // Store secret (temporarily, until verified)
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    return {
      qrCode,
      secret: secret.base32,
    };
  }

  async verifyAndEnableTwoFactor(userId: string, code: string): Promise<{ backupCodes: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Two-factor setup not initiated');
    }

    const isValid = this.verifyTwoFactorCode(user.twoFactorSecret, code);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        backupCodes,
      },
    });

    return { backupCodes };
  }

  async disableTwoFactor(userId: string, code: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication not enabled');
    }

    const isValid = this.verifyTwoFactorCode(user.twoFactorSecret, code);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });
  }

  private verifyTwoFactorCode(secret: string, code: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2, // Allow 2 time steps of variance
    });
  }

  private async updateLoginStats(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });
  }

  private sanitizeUser(user: any) {
    const { password, twoFactorSecret, backupCodes, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  // Google OAuth
  async googleLogin(user: any): Promise<{ user: any; tokens: AuthTokens }> {
    let existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      // Create new user from Google profile
      existingUser = await this.prisma.user.create({
        data: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName,
          avatar: user.picture,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Create Google account link
      await this.prisma.account.create({
        data: {
          userId: existingUser.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: user.googleId,
          access_token: user.accessToken,
          refresh_token: user.refreshToken,
        },
      });
    }

    const tokens = await this.generateTokens(existingUser);
    await this.updateLoginStats(existingUser.id);

    return {
      user: this.sanitizeUser(existingUser),
      tokens,
    };
  }
}

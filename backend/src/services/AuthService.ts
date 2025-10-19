import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { User } from '../models/User';
import { IUser } from '../types';
import { EmailService } from './EmailService';
import { logger } from '../utils/logger';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LoginResult {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

export interface DeviceInfo {
  userAgent?: string;
  ip: string;
  platform?: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  // JWT Token Operations
  generateAccessToken(payload: TokenPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: 'DhanAillytics',
      audience: 'DhanAillytics-Users',
    });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyAccessToken(token: string): TokenPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    try {
      const decoded = jwt.verify(token, secret, {
        issuer: 'DhanAillytics',
        audience: 'DhanAillytics-Users',
      }) as TokenPayload;
      
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // User Registration
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }, deviceInfo: DeviceInfo): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
    emailVerificationToken: string;
  }> {
    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = new User({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });

      // Generate email verification token
      const verificationToken = user.generateEmailVerificationToken();
      
      // Generate tokens
      const refreshToken = this.generateRefreshToken();
      user.addRefreshToken(refreshToken, deviceInfo);

      await user.save();

      // Generate access token
      const accessToken = this.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);

      // Return user data without sensitive information
      const userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar,
        preferences: user.preferences,
        subscription: user.subscription,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      logger.info(`User registered successfully: ${user.email}`);

      return {
        user: userResponse,
        accessToken,
        refreshToken,
        emailVerificationToken: verificationToken,
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  // User Login
  async login(email: string, password: string, deviceInfo: DeviceInfo, totpCode?: string): Promise<LoginResult> {
    try {
      // Find user with sensitive fields
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+twoFactorSecret +twoFactorBackupCodes');

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if account is locked
      if (user.isLocked) {
        const lockTimeRemaining = Math.ceil((user.lockUntil!.getTime() - Date.now()) / (1000 * 60));
        throw new Error(`Account is locked. Try again in ${lockTimeRemaining} minutes`);
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated. Please contact support');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw new Error('Invalid email or password');
      }

      // Check if 2FA is enabled
      if (user.twoFactorEnabled) {
        if (!totpCode) {
          return {
            user: { id: user._id },
            accessToken: '',
            refreshToken: '',
            requiresTwoFactor: true,
          };
        }

        // Verify TOTP code
        const isValidTotp = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: totpCode,
          window: 2, // Allow 2 time steps before/after
        });

        if (!isValidTotp) {
          // Check backup codes
          const backupCodeIndex = user.twoFactorBackupCodes?.findIndex(
            code => code === totpCode
          );
          
          if (backupCodeIndex === -1 || backupCodeIndex === undefined) {
            await user.incLoginAttempts();
            throw new Error('Invalid 2FA code');
          }

          // Remove used backup code
          user.twoFactorBackupCodes!.splice(backupCodeIndex, 1);
        }
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Clean expired refresh tokens
      user.cleanExpiredTokens();

      // Generate new refresh token
      const refreshToken = this.generateRefreshToken();
      user.addRefreshToken(refreshToken, deviceInfo);

      // Update last login and last active
      user.lastLogin = new Date();
      user.lastActiveAt = new Date();

      await user.save();

      // Generate access token
      const accessToken = this.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      // Return user data without sensitive information
      const userResponse = {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar,
        preferences: user.preferences,
        subscription: user.subscription,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: userResponse,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  // Refresh Access Token
  async refreshToken(refreshToken: string, deviceInfo: DeviceInfo): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const user = await User.findOne({
        'refreshTokens.token': refreshToken,
        'refreshTokens.expiresAt': { $gt: new Date() },
      });

      if (!user) {
        throw new Error('Invalid or expired refresh token');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Remove old refresh token and add new one
      user.removeRefreshToken(refreshToken);
      const newRefreshToken = this.generateRefreshToken();
      user.addRefreshToken(newRefreshToken, deviceInfo);

      // Update last active
      user.lastActiveAt = new Date();
      await user.save();

      // Generate new access token
      const newAccessToken = this.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  // Logout
  async logout(userId: string, refreshToken?: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (refreshToken) {
        user.removeRefreshToken(refreshToken);
      } else {
        // Remove all refresh tokens (logout from all devices)
        user.refreshTokens = [];
      }

      await user.save();
      logger.info(`User logged out: ${user.email}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  // Email Verification
  async verifyEmail(token: string): Promise<void> {
    try {
      const user = await User.findByEmailVerificationToken(token);
      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save();
      logger.info(`Email verified for user: ${user.email}`);
    } catch (error) {
      logger.error('Email verification failed:', error);
      throw error;
    }
  }

  // Resend Email Verification
  async resendEmailVerification(email: string): Promise<void> {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      await this.emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);
      logger.info(`Verification email resent to: ${user.email}`);
    } catch (error) {
      logger.error('Resend verification failed:', error);
      throw error;
    }
  }

  // Password Reset Request
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        return;
      }

      const resetToken = user.generatePasswordResetToken();
      await user.save();

      await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
      logger.info(`Password reset email sent to: ${user.email}`);
    } catch (error) {
      logger.error('Password reset request failed:', error);
      throw error;
    }
  }

  // Password Reset
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findByPasswordResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired password reset token');
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      // Clear all refresh tokens for security
      user.refreshTokens = [];
      
      // Reset login attempts
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();
      logger.info(`Password reset successfully for user: ${user.email}`);
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }

  // Change Password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      user.password = newPassword;
      // Clear all refresh tokens except current session for security
      user.refreshTokens = [];
      
      await user.save();
      logger.info(`Password changed for user: ${user.email}`);
    } catch (error) {
      logger.error('Password change failed:', error);
      throw error;
    }
  }

  // Two-Factor Authentication Setup
  async setup2FA(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `DhanAillytics (${user.email})`,
        issuer: 'DhanAillytics',
        length: 32,
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      // Generate QR code
      const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

      // Save to user (but don't enable yet)
      user.twoFactorSecret = secret.base32;
      user.twoFactorBackupCodes = backupCodes;
      
      await user.save();

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      logger.error('2FA setup failed:', error);
      throw error;
    }
  }

  // Enable Two-Factor Authentication
  async enable2FA(userId: string, totpCode: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+twoFactorSecret');
      if (!user || !user.twoFactorSecret) {
        throw new Error('2FA setup not initiated');
      }

      // Verify TOTP code
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: totpCode,
        window: 2,
      });

      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      user.twoFactorEnabled = true;
      await user.save();

      logger.info(`2FA enabled for user: ${user.email}`);
    } catch (error) {
      logger.error('2FA enable failed:', error);
      throw error;
    }
  }

  // Disable Two-Factor Authentication
  async disable2FA(userId: string, totpCode: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.twoFactorEnabled) {
        throw new Error('2FA is not enabled');
      }

      // Verify TOTP code or backup code
      let isValid = false;
      
      if (user.twoFactorSecret) {
        isValid = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: totpCode,
          window: 2,
        });
      }

      // Check backup codes if TOTP failed
      if (!isValid && user.twoFactorBackupCodes) {
        isValid = user.twoFactorBackupCodes.includes(totpCode);
      }

      if (!isValid) {
        throw new Error('Invalid 2FA code');
      }

      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.twoFactorBackupCodes = [];

      await user.save();
      logger.info(`2FA disabled for user: ${user.email}`);
    } catch (error) {
      logger.error('2FA disable failed:', error);
      throw error;
    }
  }

  // Validate user session and return user data
  async validateSession(token: string): Promise<Partial<IUser>> {
    try {
      const payload = this.verifyAccessToken(token);
      
      const user = await User.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('Invalid session');
      }

      // Update last active
      await user.updateLastActive();

      return {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatar,
        preferences: user.preferences,
        subscription: user.subscription,
        lastActiveAt: user.lastActiveAt,
      };
    } catch (error) {
      logger.error('Session validation failed:', error);
      throw error;
    }
  }
}

export default AuthService;

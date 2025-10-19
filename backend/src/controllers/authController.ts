import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { AuthService, DeviceInfo } from '../services/AuthService';
import { EmailService } from '../services/EmailService';
import { logger } from '../utils/logger';

export class AuthController {
  private authService: AuthService;
  private emailService: EmailService;

  constructor() {
    this.authService = new AuthService();
    this.emailService = new EmailService();
  }

  // Extract device info from request
  private getDeviceInfo(req: Request): DeviceInfo {
    return {
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress || 'Unknown',
      platform: req.get('Sec-Ch-Ua-Platform') || 'Unknown',
    };
  }

  // Handle validation errors
  private handleValidationErrors(req: Request, res: Response): boolean {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
        })),
      });
    }
    return false;
  }

  // Set authentication cookies
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  // Clear authentication cookies
  private clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  // User Registration
  async register(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { email, password, firstName, lastName, phone } = req.body;
      const deviceInfo = this.getDeviceInfo(req);

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      }, deviceInfo);

      // Set authentication cookies
      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      logger.info(`User registered: ${email}`);

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      
      const message = error instanceof Error ? error.message : 'Registration failed';
      const statusCode = message.includes('already exists') ? 409 : 500;

      return res.status(statusCode).json({
        success: false,
        message,
        code: 'REGISTRATION_FAILED',
      });
    }
  }

  // User Login
  async login(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { email, password, totpCode, rememberMe } = req.body;
      const deviceInfo = this.getDeviceInfo(req);

      const result = await this.authService.login(email, password, deviceInfo, totpCode);

      // If 2FA is required
      if (result.requiresTwoFactor) {
        return res.status(200).json({
          success: true,
          message: 'Two-factor authentication required',
          data: {
            requiresTwoFactor: true,
            userId: result.user.id,
          },
          code: 'TWO_FACTOR_REQUIRED',
        });
      }

      // Set authentication cookies
      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      logger.info(`User logged in: ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      
      const message = error instanceof Error ? error.message : 'Login failed';
      let statusCode = 500;

      if (message.includes('Invalid email or password') || 
          message.includes('Invalid 2FA code')) {
        statusCode = 401;
      } else if (message.includes('locked') || 
                 message.includes('deactivated')) {
        statusCode = 403;
      }

      return res.status(statusCode).json({
        success: false,
        message,
        code: 'LOGIN_FAILED',
      });
    }
  }

  // Refresh Access Token
  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required',
          code: 'REFRESH_TOKEN_REQUIRED',
        });
      }

      const deviceInfo = this.getDeviceInfo(req);
      const result = await this.authService.refreshToken(refreshToken, deviceInfo);

      // Set new authentication cookies
      this.setAuthCookies(res, result.accessToken, result.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      
      this.clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        code: 'REFRESH_TOKEN_INVALID',
      });
    }
  }

  // User Logout
  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      const refreshToken = req.cookies.refreshToken;
      const logoutAll = req.body.logoutAll === true;

      if (userId) {
        await this.authService.logout(userId, logoutAll ? undefined : refreshToken);
      }

      this.clearAuthCookies(res);

      return res.status(200).json({
        success: true,
        message: logoutAll ? 'Logged out from all devices' : 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      
      this.clearAuthCookies(res);
      
      return res.status(200).json({
        success: true,
        message: 'Logout completed',
      });
    }
  }

  // Email Verification
  async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required',
          code: 'VERIFICATION_TOKEN_REQUIRED',
        });
      }

      await this.authService.verifyEmail(token);

      // Send welcome email after successful verification
      const user = req.user; // Assuming middleware provides user after verification
      if (user) {
        try {
          await this.emailService.sendWelcomeEmail(user.email, user.firstName || 'User');
        } catch (emailError) {
          logger.error('Welcome email error:', emailError);
          // Don't fail the verification if email fails
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        code: 'EMAIL_VERIFICATION_FAILED',
      });
    }
  }

  // Resend Email Verification
  async resendEmailVerification(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { email } = req.body;
      
      await this.authService.resendEmailVerification(email);

      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      const statusCode = message.includes('not found') ? 404 : 
                        message.includes('already verified') ? 400 : 500;

      return res.status(statusCode).json({
        success: false,
        message,
        code: 'RESEND_VERIFICATION_FAILED',
      });
    }
  }

  // Request Password Reset
  async requestPasswordReset(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { email } = req.body;
      
      await this.authService.requestPasswordReset(email);

      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    } catch (error) {
      logger.error('Password reset request error:', error);
      
      // Always return success to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }
  }

  // Reset Password
  async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { token, newPassword } = req.body;
      
      await this.authService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
      });
    } catch (error) {
      logger.error('Password reset error:', error);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        code: 'PASSWORD_RESET_FAILED',
      });
    }
  }

  // Change Password
  async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      // Send notification email
      try {
        const userData = await this.authService.validateSession(req.cookies.accessToken || '');
        await this.emailService.sendPasswordChangeNotification(userData.email!, userData.firstName || 'User');
      } catch (emailError) {
        logger.error('Password change notification error:', emailError);
      }

      // Clear authentication cookies to force re-login
      this.clearAuthCookies(res);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in again.',
      });
    } catch (error) {
      logger.error('Password change error:', error);
      
      const message = error instanceof Error ? error.message : 'Failed to change password';
      const statusCode = message.includes('incorrect') ? 400 : 500;

      return res.status(statusCode).json({
        success: false,
        message,
        code: 'PASSWORD_CHANGE_FAILED',
      });
    }
  }

  // Setup Two-Factor Authentication
  async setup2FA(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const result = await this.authService.setup2FA(userId);

      return res.status(200).json({
        success: true,
        message: '2FA setup initiated',
        data: {
          secret: result.secret,
          qrCode: result.qrCode,
          backupCodes: result.backupCodes,
        },
      });
    } catch (error) {
      logger.error('2FA setup error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to setup 2FA',
        code: 'TWO_FA_SETUP_FAILED',
      });
    }
  }

  // Enable Two-Factor Authentication
  async enable2FA(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { totpCode } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      await this.authService.enable2FA(userId, totpCode);

      // Send notification email
      try {
        const userData = await this.authService.validateSession(req.cookies.accessToken || '');
        await this.emailService.send2FAEnabledNotification(userData.email!, userData.firstName || 'User');
      } catch (emailError) {
        logger.error('2FA enabled notification error:', emailError);
      }

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication enabled successfully',
      });
    } catch (error) {
      logger.error('2FA enable error:', error);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code',
        code: 'TWO_FA_ENABLE_FAILED',
      });
    }
  }

  // Disable Two-Factor Authentication
  async disable2FA(req: Request, res: Response): Promise<Response> {
    try {
      if (this.handleValidationErrors(req, res)) return;

      const { totpCode } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      await this.authService.disable2FA(userId, totpCode);

      return res.status(200).json({
        success: true,
        message: 'Two-factor authentication disabled successfully',
      });
    } catch (error) {
      logger.error('2FA disable error:', error);
      
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code',
        code: 'TWO_FA_DISABLE_FAILED',
      });
    }
  }

  // Get Current User
  async getCurrentUser(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required',
          code: 'ACCESS_TOKEN_REQUIRED',
        });
      }

      const userData = await this.authService.validateSession(token);

      return res.status(200).json({
        success: true,
        data: {
          user: userData,
        },
      });
    } catch (error) {
      logger.error('Get current user error:', error);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid session',
        code: 'INVALID_SESSION',
      });
    }
  }

  // Validate Session
  async validateSession(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required',
          code: 'ACCESS_TOKEN_REQUIRED',
        });
      }

      const userData = await this.authService.validateSession(token);

      return res.status(200).json({
        success: true,
        message: 'Session is valid',
        data: {
          user: userData,
        },
      });
    } catch (error) {
      logger.error('Session validation error:', error);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
        code: 'INVALID_SESSION',
      });
    }
  }
}

// Validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('totpCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('2FA code must be 6 digits'),
];

export const emailValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

export const totpValidation = [
  body('totpCode')
    .isLength({ min: 6, max: 8 })
    .isNumeric()
    .withMessage('TOTP code must be 6-8 digits'),
];

// Rate limiting configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default AuthController;

import { Router } from 'express';
import AuthController, {
  registerValidation,
  loginValidation,
  emailValidation,
  resetPasswordValidation,
  changePasswordValidation,
  totpValidation,
  authRateLimit,
  passwordResetRateLimit,
} from '../controllers/authController';
import {
  authenticate,
  requireAuth,
  requireVerifiedEmail,
} from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Bind controller methods to preserve 'this' context
const register = authController.register.bind(authController);
const login = authController.login.bind(authController);
const refreshToken = authController.refreshToken.bind(authController);
const logout = authController.logout.bind(authController);
const verifyEmail = authController.verifyEmail.bind(authController);
const resendEmailVerification = authController.resendEmailVerification.bind(authController);
const requestPasswordReset = authController.requestPasswordReset.bind(authController);
const resetPassword = authController.resetPassword.bind(authController);
const changePassword = authController.changePassword.bind(authController);
const setup2FA = authController.setup2FA.bind(authController);
const enable2FA = authController.enable2FA.bind(authController);
const disable2FA = authController.disable2FA.bind(authController);
const getCurrentUser = authController.getCurrentUser.bind(authController);
const validateSession = authController.validateSession.bind(authController);

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email, password, firstName, lastName, phone? }
 */
router.post('/register', authRateLimit, registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { email, password, totpCode?, rememberMe? }
 */
router.post('/login', authRateLimit, loginValidation, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @body    { refreshToken? } (can also use httpOnly cookie)
 */
router.post('/refresh', refreshToken);

/**
 * @route   GET /api/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 * @query   { token }
 */
router.get('/verify-email', verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 * @body    { email }
 */
router.post('/resend-verification', authRateLimit, emailValidation, resendEmailVerification);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 * @body    { email }
 */
router.post('/forgot-password', passwordResetRateLimit, emailValidation, requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 * @body    { token, newPassword }
 */
router.post('/reset-password', passwordResetRateLimit, resetPasswordValidation, resetPassword);

/**
 * @route   GET /api/auth/validate
 * @desc    Validate current session
 * @access  Public (but requires valid token)
 */
router.get('/validate', validateSession);

// Protected routes (authentication required)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 * @body    { logoutAll? }
 */
router.post('/logout', authenticate({ required: false }), logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', requireAuth, getCurrentUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password', requireAuth, changePasswordValidation, changePassword);

// Two-Factor Authentication routes

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Setup two-factor authentication
 * @access  Private
 */
router.post('/2fa/setup', requireAuth, setup2FA);

/**
 * @route   POST /api/auth/2fa/enable
 * @desc    Enable two-factor authentication
 * @access  Private
 * @body    { totpCode }
 */
router.post('/2fa/enable', requireAuth, totpValidation, enable2FA);

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable two-factor authentication
 * @access  Private
 * @body    { totpCode }
 */
router.post('/2fa/disable', requireAuth, totpValidation, disable2FA);

// Additional utility routes

/**
 * @route   GET /api/auth/session-info
 * @desc    Get detailed session information
 * @access  Private
 */
router.get('/session-info', requireAuth, async (req, res) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'ACCESS_TOKEN_REQUIRED',
      });
    }

    const authService = authController['authService'];
    const userData = await authService.validateSession(token);
    
    // Extract session info
    const payload = authService.verifyAccessToken(token);
    
    return res.json({
      success: true,
      data: {
        user: userData,
        session: {
          issuedAt: new Date(payload.iat! * 1000),
          expiresAt: new Date(payload.exp! * 1000),
          timeToExpiry: (payload.exp! * 1000) - Date.now(),
        },
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid session',
      code: 'INVALID_SESSION',
    });
  }
});

/**
 * @route   GET /api/auth/security
 * @desc    Get security settings and status
 * @access  Private
 */
router.get('/security', requireAuth, async (req, res) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'ACCESS_TOKEN_REQUIRED',
      });
    }

    const authService = authController['authService'];
    const userData = await authService.validateSession(token);
    
    const securityInfo = {
      twoFactorEnabled: userData.twoFactorEnabled,
      emailVerified: userData.isEmailVerified,
      lastLogin: userData.lastLogin,
      lastActiveAt: userData.lastActiveAt,
      accountStatus: userData.isActive ? 'active' : 'inactive',
      // Don't expose sensitive information like backup codes or tokens
    };

    return res.json({
      success: true,
      data: {
        security: securityInfo,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid session',
      code: 'INVALID_SESSION',
    });
  }
});

/**
 * @route   POST /api/auth/validate-password
 * @desc    Validate current password (for sensitive operations)
 * @access  Private
 * @body    { password }
 */
router.post('/validate-password', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user?.userId;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
        code: 'PASSWORD_REQUIRED',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Import User model to check password
    const { User } = await import('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const isValid = await user.comparePassword(password);
    
    return res.json({
      success: true,
      data: {
        valid: isValid,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

// Health check for auth service
/**
 * @route   GET /api/auth/health
 * @desc    Auth service health check
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    // Check if auth service dependencies are working
    const checks = {
      database: false,
      email: false,
      jwt: false,
    };

    // Check database connection
    try {
      const { User } = await import('../models/User');
      await User.findOne().limit(1);
      checks.database = true;
    } catch (error) {
      // Database check failed
    }

    // Check email service
    try {
      const { EmailService } = await import('../services/EmailService');
      const emailService = new EmailService();
      checks.email = await emailService.testConnection();
    } catch (error) {
      // Email service check failed
    }

    // Check JWT functionality
    try {
      const authService = authController['authService'];
      const testToken = authService.generateAccessToken({
        userId: 'test',
        email: 'test@example.com',
        role: 'user',
      });
      authService.verifyAccessToken(testToken);
      checks.jwt = true;
    } catch (error) {
      // JWT check failed
    }

    const isHealthy = Object.values(checks).every(check => check);

    return res.status(isHealthy ? 200 : 503).json({
      success: true,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Health check failed',
      code: 'HEALTH_CHECK_FAILED',
    });
  }
});

export default router;

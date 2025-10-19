import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { logger } from '../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export interface AuthMiddlewareOptions {
  required?: boolean;
  roles?: string[];
  emailVerified?: boolean;
  twoFactorRequired?: boolean;
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Extract token from request headers or cookies
  private extractToken(req: Request): string | null {
    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }

    return null;
  }

  // Main authentication middleware
  authenticate(options: AuthMiddlewareOptions = {}) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = this.extractToken(req);

        // If no token and authentication is not required, continue
        if (!token && !options.required) {
          return next();
        }

        // If no token and authentication is required, return error
        if (!token && options.required) {
          return res.status(401).json({
            success: false,
            message: 'Access token is required',
            code: 'AUTH_TOKEN_REQUIRED'
          });
        }

        // Verify token
        if (token) {
          try {
            const payload = this.authService.verifyAccessToken(token);
            
            // Add user info to request
            req.user = {
              userId: payload.userId,
              email: payload.email,
              role: payload.role,
            };

            // Optional: Validate session and get full user data
            if (options.emailVerified || options.twoFactorRequired) {
              const userData = await this.authService.validateSession(token);
              
              // Check email verification requirement
              if (options.emailVerified && !userData?.isEmailVerified) {
                return res.status(403).json({
                  success: false,
                  message: 'Email verification required',
                  code: 'EMAIL_NOT_VERIFIED'
                });
              }

              // Check two-factor authentication requirement (safe check for optional property)
              if (options.twoFactorRequired && !(userData as any)?.twoFactorEnabled) {
                return res.status(403).json({
                  success: false,
                  message: 'Two-factor authentication required',
                  code: 'TWO_FACTOR_REQUIRED'
                });
              }
            }

            logger.debug(`User authenticated: ${req.user.email}`);
          } catch (error) {
            return res.status(401).json({
              success: false,
              message: 'Invalid or expired access token',
              code: 'AUTH_TOKEN_INVALID'
            });
          }
        }

        next();
      } catch (error) {
        logger.error('Authentication middleware error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          code: 'AUTH_MIDDLEWARE_ERROR'
        });
      }
    };
  }

  // Role-based authorization middleware
  authorize(allowedRoles: string | string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role}. Required roles: ${roles.join(', ')}`);
        
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          details: {
            userRole: req.user.role,
            requiredRoles: roles
          }
        });
      }

      return next();
    };
  }

  // Check if user owns the resource
  checkResourceOwnership(userIdField: string = 'userId') {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Get user ID from params, body, or query
      const resourceUserId = req.params[userIdField] || 
                            req.body[userIdField] || 
                            req.query[userIdField];

      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          message: 'Resource user ID not provided',
          code: 'RESOURCE_USER_ID_MISSING'
        });
      }

      // Check if user owns the resource or has admin privileges
      if (req.user.userId !== resourceUserId && 
          !['admin', 'analyst'].includes(req.user.role)) {
        logger.warn(`Access denied: User ${req.user.email} tried to access resource owned by ${resourceUserId}`);
        
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only access your own resources',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      return next();
    };
  }

  // Rate limiting based on user
  rateLimit(maxRequests: number, windowMs: number) {
    const userRequests = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(); // Skip rate limiting for unauthenticated requests
      }

      const userId = req.user.userId;
      const now = Date.now();
      
      // Clean up expired entries
      for (const [key, value] of userRequests.entries()) {
        if (now > value.resetTime) {
          userRequests.delete(key);
        }
      }

      const userRequestData = userRequests.get(userId);
      
      if (!userRequestData || now > userRequestData.resetTime) {
        // First request in window or window expired
        userRequests.set(userId, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }

      if (userRequestData.count >= maxRequests) {
        const resetIn = Math.ceil((userRequestData.resetTime - now) / 1000);
        
        logger.warn(`Rate limit exceeded for user ${req.user.email}`);
        
        return res.status(429).json({
          success: false,
          message: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            maxRequests,
            windowMs,
            resetIn
          }
        });
      }

      // Increment request count
      userRequestData.count++;
      next();
    };
  }

  // Subscription-based access control
  checkSubscription(requiredPlans: string | string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      try {
        // Get full user data to check subscription
        const token = this.extractToken(req);
        if (!token) {
          return res.status(401).json({
            success: false,
            message: 'Access token required',
            code: 'AUTH_TOKEN_REQUIRED'
          });
        }

        const userData = await this.authService.validateSession(token);
        const plans = Array.isArray(requiredPlans) ? requiredPlans : [requiredPlans];

        if (!userData.subscription || 
            !plans.includes(userData.subscription.plan) ||
            userData.subscription.status !== 'active') {
          
          logger.warn(`Subscription access denied for user ${req.user.email}. Current plan: ${userData.subscription?.plan}, Status: ${userData.subscription?.status}`);
          
          return res.status(403).json({
            success: false,
            message: 'Subscription upgrade required',
            code: 'SUBSCRIPTION_REQUIRED',
            details: {
              currentPlan: userData.subscription?.plan || 'none',
              currentStatus: userData.subscription?.status || 'inactive',
              requiredPlans: plans
            }
          });
        }

        return next();
      } catch (error) {
        logger.error('Subscription check error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          code: 'SUBSCRIPTION_CHECK_ERROR'
        });
      }
    };
  }

  // Check if account is locked or deactivated
  checkAccountStatus() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(); // Skip for unauthenticated requests
      }

      try {
        const token = this.extractToken(req);
        if (!token) {
          return next();
        }

        const userData = await this.authService.validateSession(token);
        
        if (!(userData as any)?.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Account is deactivated',
            code: 'ACCOUNT_DEACTIVATED'
          });
        }

        return next();
      } catch (error) {
        // If validation fails, let the authenticate middleware handle it
        next();
      }
    };
  }
}

// Create singleton instance
const authMiddleware = new AuthMiddleware();

// Export convenience functions
export const authenticate = authMiddleware.authenticate.bind(authMiddleware);
export const authorize = authMiddleware.authorize.bind(authMiddleware);
export const checkResourceOwnership = authMiddleware.checkResourceOwnership.bind(authMiddleware);
export const rateLimit = authMiddleware.rateLimit.bind(authMiddleware);
export const checkSubscription = authMiddleware.checkSubscription.bind(authMiddleware);
export const checkAccountStatus = authMiddleware.checkAccountStatus.bind(authMiddleware);

// Common middleware combinations
export const requireAuth = authenticate({ required: true });
export const requireVerifiedEmail = authenticate({ required: true, emailVerified: true });
export const requireTwoFactor = authenticate({ required: true, twoFactorRequired: true });
export const requireAdmin = [requireAuth, authorize(['admin'])];
export const requireAnalyst = [requireAuth, authorize(['admin', 'analyst'])];
export const requirePremium = [requireAuth, checkSubscription(['premium', 'enterprise'])];

// Legacy exports for backward compatibility
export const legacyAuthMiddleware = authenticate({ required: true });
export const optionalAuth = authenticate({ required: false });
export const requireRole = (roles: string[]) => authorize(roles);

// Export for aiRoutes compatibility
export const auth = authenticate({ required: true });

export default authMiddleware;

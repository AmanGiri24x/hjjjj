# DhanAillytics Authentication System

This document provides comprehensive information about the authentication system implemented in the DhanAillytics backend API.

## Overview

The authentication system provides a complete, production-ready authentication solution with the following features:

- **JWT-based Authentication** with access and refresh tokens
- **Two-Factor Authentication (2FA)** using TOTP
- **Email Verification** with HTML templates
- **Password Reset** with secure token-based flow
- **Social Authentication** (Google, GitHub, LinkedIn, Apple)
- **Account Security** features (lockout, rate limiting, session management)
- **Role-based Access Control** (RBAC)
- **Subscription-based Access Control**
- **Device Management** with refresh token tracking

## Architecture

### Core Components

1. **AuthService** (`src/services/AuthService.ts`)
   - JWT token generation and verification
   - User registration and authentication
   - Password management and reset
   - 2FA setup and verification
   - Session validation

2. **EmailService** (`src/services/EmailService.ts`)
   - Multi-provider email support (Gmail, SendGrid, Mailgun, etc.)
   - Beautiful HTML email templates
   - Email verification, password reset notifications
   - Welcome emails and security notifications

3. **AuthController** (`src/controllers/authController.ts`)
   - RESTful API endpoints for all auth operations
   - Input validation and sanitization
   - Rate limiting and security controls
   - Cookie-based authentication support

4. **Authentication Middleware** (`src/middleware/auth.ts`)
   - JWT token verification
   - Role-based authorization
   - Resource ownership checks
   - Session validation
   - Rate limiting per user

5. **User Model** (`src/models/User.ts`)
   - Comprehensive user schema with auth fields
   - Password hashing and comparison
   - Token management methods
   - Security features (lockout, 2FA)

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| GET | `/api/v1/auth/verify-email` | Verify email address |
| POST | `/api/v1/auth/resend-verification` | Resend verification email |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| GET | `/api/v1/auth/validate` | Validate session |
| GET | `/api/v1/auth/health` | Auth service health check |

### Protected Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/logout` | User logout |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/change-password` | Change password |
| POST | `/api/v1/auth/2fa/setup` | Setup 2FA |
| POST | `/api/v1/auth/2fa/enable` | Enable 2FA |
| POST | `/api/v1/auth/2fa/disable` | Disable 2FA |
| GET | `/api/v1/auth/session-info` | Get session details |
| GET | `/api/v1/auth/security` | Get security status |
| POST | `/api/v1/auth/validate-password` | Validate password |

## Authentication Flow

### Registration Flow

1. **POST `/api/v1/auth/register`**
   ```json
   {
     "email": "user@example.com",
     "password": "SecurePass123!",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+1234567890"
   }
   ```

2. **Email Verification**
   - User receives verification email with token
   - GET `/api/v1/auth/verify-email?token=<token>`

3. **Welcome Email**
   - Sent after successful verification

### Login Flow

1. **POST `/api/v1/auth/login`**
   ```json
   {
     "email": "user@example.com",
     "password": "SecurePass123!",
     "totpCode": "123456" // Optional for 2FA
   }
   ```

2. **Response (Success)**
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "user": { /* user data */ },
       "accessToken": "jwt_token",
       "refreshToken": "refresh_token"
     }
   }
   ```

3. **Response (2FA Required)**
   ```json
   {
     "success": true,
     "message": "Two-factor authentication required",
     "data": {
       "requiresTwoFactor": true,
       "userId": "user_id"
     },
     "code": "TWO_FACTOR_REQUIRED"
   }
   ```

### Token Refresh Flow

1. **POST `/api/v1/auth/refresh`**
   - Can use httpOnly cookie or request body
   ```json
   {
     "refreshToken": "refresh_token"
   }
   ```

2. **Response**
   ```json
   {
     "success": true,
     "message": "Token refreshed successfully",
     "data": {
       "accessToken": "new_jwt_token",
       "refreshToken": "new_refresh_token"
     }
   }
   ```

### Password Reset Flow

1. **POST `/api/v1/auth/forgot-password`**
   ```json
   {
     "email": "user@example.com"
   }
   ```

2. **Email with Reset Link**
   - User receives email with reset token (10 min expiry)

3. **POST `/api/v1/auth/reset-password`**
   ```json
   {
     "token": "reset_token",
     "newPassword": "NewSecurePass123!"
   }
   ```

### Two-Factor Authentication Setup

1. **POST `/api/v1/auth/2fa/setup`** (Protected)
   - Returns QR code and backup codes

2. **POST `/api/v1/auth/2fa/enable`** (Protected)
   ```json
   {
     "totpCode": "123456"
   }
   ```

3. **POST `/api/v1/auth/2fa/disable`** (Protected)
   ```json
   {
     "totpCode": "123456"
   }
   ```

## Authentication Middleware

### Basic Usage

```typescript
import { requireAuth, authorize, checkSubscription } from '../middleware/auth';

// Require authentication
router.get('/protected', requireAuth, handler);

// Require specific role
router.get('/admin', requireAuth, authorize(['admin']), handler);

// Require subscription
router.get('/premium', requireAuth, checkSubscription(['premium']), handler);
```

### Advanced Middleware Options

```typescript
import { authenticate } from '../middleware/auth';

// Optional authentication
router.get('/public', authenticate({ required: false }), handler);

// Require email verification
router.get('/verified', authenticate({ 
  required: true, 
  emailVerified: true 
}), handler);

// Require 2FA
router.get('/secure', authenticate({ 
  required: true, 
  twoFactorRequired: true 
}), handler);
```

### Resource Ownership

```typescript
import { checkResourceOwnership } from '../middleware/auth';

// Check if user owns the resource
router.get('/user/:userId/data', 
  requireAuth, 
  checkResourceOwnership('userId'), 
  handler
);
```

## Security Features

### Account Lockout
- **Max attempts**: 5 failed login attempts
- **Lockout duration**: 2 hours
- **Automatic reset**: After successful login

### Rate Limiting
- **Authentication endpoints**: 5 attempts per 15 minutes
- **Password reset**: 3 attempts per hour
- **Per-user limits**: Configurable per endpoint

### Session Management
- **Access token lifetime**: 15 minutes
- **Refresh token lifetime**: 30 days
- **Multiple device support**: Up to 5 active sessions
- **Device tracking**: User agent, IP, platform

### Password Security
- **Minimum length**: 8 characters
- **Complexity**: Must include uppercase, lowercase, number, and special character
- **Hashing**: bcrypt with configurable salt rounds (default: 12)
- **Reset token expiry**: 10 minutes

### Two-Factor Authentication
- **Algorithm**: Time-based OTP (TOTP)
- **Backup codes**: 10 single-use codes
- **Window**: 2 time steps (±60 seconds)
- **QR code generation**: For easy setup

## Email Configuration

### Supported Providers

1. **Gmail**
   ```env
   EMAIL_PROVIDER=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_APP_PASSWORD=your_app_password
   ```

2. **SendGrid**
   ```env
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=your_api_key
   ```

3. **Mailgun**
   ```env
   EMAIL_PROVIDER=mailgun
   MAILGUN_USERNAME=your_username
   MAILGUN_PASSWORD=your_password
   ```

4. **Custom SMTP**
   ```env
   EMAIL_PROVIDER=smtp
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=username
   EMAIL_PASSWORD=password
   ```

### Email Templates

The system includes professionally designed HTML email templates for:
- **Email Verification**: Welcome message with verification link
- **Password Reset**: Security notice with reset link
- **Password Changed**: Confirmation notification
- **Welcome Email**: Sent after email verification
- **2FA Enabled**: Security notification

## Environment Variables

### Required Variables

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_characters
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_PROVIDER=gmail
EMAIL_FROM=noreply@dhanaillytics.com
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_SALT_ROUNDS=12
```

### Optional Variables

```env
# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Mailgun
MAILGUN_USERNAME=your_mailgun_username
MAILGUN_PASSWORD=your_mailgun_password

# Custom SMTP
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## Error Codes

### Authentication Errors

| Code | Description |
|------|-------------|
| `AUTH_TOKEN_REQUIRED` | Access token is required |
| `AUTH_TOKEN_INVALID` | Invalid or expired access token |
| `REFRESH_TOKEN_REQUIRED` | Refresh token is required |
| `REFRESH_TOKEN_INVALID` | Invalid or expired refresh token |
| `AUTH_REQUIRED` | Authentication required |
| `EMAIL_NOT_VERIFIED` | Email verification required |
| `TWO_FACTOR_REQUIRED` | Two-factor authentication required |

### Authorization Errors

| Code | Description |
|------|-------------|
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_ACCESS_DENIED` | Cannot access resource |
| `SUBSCRIPTION_REQUIRED` | Subscription upgrade required |
| `ACCOUNT_DEACTIVATED` | Account is deactivated |

### Validation Errors

| Code | Description |
|------|-------------|
| `REGISTRATION_FAILED` | Registration failed |
| `LOGIN_FAILED` | Login failed |
| `PASSWORD_CHANGE_FAILED` | Password change failed |
| `EMAIL_VERIFICATION_FAILED` | Email verification failed |
| `TWO_FA_SETUP_FAILED` | 2FA setup failed |

## Database Schema

### User Model Fields

```typescript
interface IUser {
  // Basic Information
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  
  // Authentication
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  
  // Session Management
  refreshTokens: RefreshToken[];
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  lastActiveAt?: Date;
  
  // Account Status
  isActive: boolean;
  deactivatedAt?: Date;
  deactivationReason?: string;
  
  // Social Accounts
  socialAccounts: SocialAccount[];
  
  // Authorization
  role: 'user' | 'premium' | 'admin' | 'analyst';
  
  // Subscription
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    // ... other subscription fields
  };
  
  // Preferences
  preferences: UserPreferences;
}
```

## Testing

### Test User Creation

```typescript
// Create test user
const testUser = {
  email: 'test@example.com',
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'User'
};

const response = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testUser)
});
```

### Authentication Testing

```typescript
// Login test
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPass123!'
  })
});

const { accessToken } = await loginResponse.json();

// Protected route test
const protectedResponse = await fetch('/api/v1/auth/me', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## Migration and Deployment

### Database Migrations

The User model includes automatic index creation for optimal query performance:

```typescript
// Indexes created automatically
userSchema.index({ email: 1 });
userSchema.index({ 'socialAccounts.provider': 1, 'socialAccounts.providerId': 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ lockUntil: 1 });
```

### Production Considerations

1. **Environment Variables**
   - Use strong, randomly generated JWT secrets
   - Configure email provider with production credentials
   - Set appropriate CORS origins

2. **Security Headers**
   - HTTPS only in production
   - Secure cookie settings
   - CSP headers configured

3. **Rate Limiting**
   - Adjust limits based on expected traffic
   - Consider implementing Redis-backed rate limiting

4. **Monitoring**
   - Log authentication events
   - Monitor failed login attempts
   - Set up alerts for suspicious activity

## Support

For questions or issues related to the authentication system:

1. Check the API documentation
2. Review error codes and messages
3. Check server logs for detailed error information
4. Verify environment variable configuration

## Security Best Practices

1. **JWT Secrets**
   - Use cryptographically secure random strings
   - Minimum 32 characters length
   - Rotate secrets regularly in production

2. **Password Policies**
   - Enforce strong password requirements
   - Consider implementing password history
   - Regular password rotation reminders

3. **Session Management**
   - Short-lived access tokens (15 minutes)
   - Secure refresh token storage
   - Regular cleanup of expired tokens

4. **2FA Implementation**
   - Encourage 2FA adoption
   - Secure backup code storage
   - Time-based code verification

5. **Email Security**
   - Use app-specific passwords for Gmail
   - Implement email rate limiting
   - Verify email deliverability

This authentication system provides enterprise-grade security features while maintaining ease of use and integration. It's designed to be scalable, maintainable, and secure for production use.

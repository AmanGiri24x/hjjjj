import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';
import { SessionService } from './session.service';
import { EncryptionService } from './encryption.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export interface SecurityEvent {
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  metadata?: any;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SessionConfig {
  maxAge: number; // in milliseconds
  idleTimeout: number; // in milliseconds
  maxConcurrentSessions: number;
  requireReauth: boolean;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly defaultSessionConfig: SessionConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 3,
    requireReauth: false,
  };

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private sessionService: SessionService,
    private encryption: EncryptionService,
  ) {}

  /**
   * Log security event and assess risk
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log the event
      await this.auditLog.log({
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
        timestamp: new Date(),
        riskLevel: event.riskLevel,
      });

      // Assess risk and take action if needed
      await this.assessRiskAndRespond(event);

      this.logger.log(`Security event logged: ${event.action} by user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`, error.stack);
    }
  }

  /**
   * Validate session security
   */
  async validateSession(sessionId: string, userId: string, ipAddress: string): Promise<boolean> {
    try {
      const session = await this.sessionService.getSession(sessionId);
      
      if (!session || session.userId !== userId) {
        await this.logSecurityEvent({
          userId,
          action: 'INVALID_SESSION',
          resource: 'session',
          ipAddress,
          userAgent: '',
          riskLevel: 'HIGH',
        });
        return false;
      }

      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.sessionService.invalidateSession(sessionId);
        await this.logSecurityEvent({
          userId,
          action: 'SESSION_EXPIRED',
          resource: 'session',
          ipAddress,
          userAgent: '',
          riskLevel: 'MEDIUM',
        });
        return false;
      }

      // Check for suspicious IP changes
      if (session.ipAddress !== ipAddress) {
        await this.logSecurityEvent({
          userId,
          action: 'IP_ADDRESS_CHANGE',
          resource: 'session',
          ipAddress,
          userAgent: '',
          metadata: { previousIp: session.ipAddress, newIp: ipAddress },
          riskLevel: 'HIGH',
        });
        
        // Invalidate session for security
        await this.sessionService.invalidateSession(sessionId);
        return false;
      }

      // Update session activity
      await this.sessionService.updateSessionActivity(sessionId);
      return true;
    } catch (error) {
      this.logger.error(`Session validation failed: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptSensitiveData(data: string): Promise<string> {
    return this.encryption.encrypt(data);
  }

  /**
   * Decrypt sensitive data
   */
  async decryptSensitiveData(encryptedData: string): Promise<string> {
    return this.encryption.decrypt(encryptedData);
  }

  /**
   * Hash password with salt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
      score += 2;
    } else if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Avoid repeating characters');

    const isValid = score >= 5;
    return { isValid, score, feedback };
  }

  /**
   * Check for suspicious activity patterns
   */
  private async assessRiskAndRespond(event: SecurityEvent): Promise<void> {
    const recentEvents = await this.auditLog.getRecentEvents(event.userId, 60); // Last 60 minutes
    
    // Check for multiple failed login attempts
    if (event.action === 'LOGIN_FAILED') {
      const failedLogins = recentEvents.filter(e => e.action === 'LOGIN_FAILED').length;
      if (failedLogins >= 5) {
        await this.lockUserAccount(event.userId, 'Multiple failed login attempts');
      }
    }

    // Check for unusual access patterns
    const uniqueIPs = new Set(recentEvents.map(e => e.ipAddress)).size;
    if (uniqueIPs > 3) {
      await this.flagSuspiciousActivity(event.userId, 'Multiple IP addresses');
    }

    // Check for high-risk actions
    if (event.riskLevel === 'CRITICAL') {
      await this.triggerSecurityAlert(event);
    }
  }

  /**
   * Lock user account for security
   */
  private async lockUserAccount(userId: string, reason: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isLocked: true,
          lockedAt: new Date(),
          lockReason: reason,
        },
      });

      // Invalidate all user sessions
      await this.sessionService.invalidateAllUserSessions(userId);

      this.logger.warn(`User account locked: ${userId} - ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to lock user account: ${error.message}`, error.stack);
    }
  }

  /**
   * Flag suspicious activity
   */
  private async flagSuspiciousActivity(userId: string, reason: string): Promise<void> {
    await this.logSecurityEvent({
      userId,
      action: 'SUSPICIOUS_ACTIVITY',
      resource: 'account',
      ipAddress: '',
      userAgent: '',
      metadata: { reason },
      riskLevel: 'HIGH',
    });
  }

  /**
   * Trigger security alert for critical events
   */
  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // In production, this would send alerts to security team
    this.logger.error(`CRITICAL SECURITY EVENT: ${JSON.stringify(event)}`);
    
    // Could integrate with alerting systems like PagerDuty, Slack, etc.
    // await this.alertingService.sendCriticalAlert(event);
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    return this.generateSecureToken(32);
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionToken: string): boolean {
    // In production, implement proper CSRF token validation
    // This is a simplified version
    return token && token.length === 64 && sessionToken;
  }

  /**
   * Rate limiting check
   */
  async checkRateLimit(identifier: string, action: string, limit: number, windowMs: number): Promise<boolean> {
    const key = `rate_limit:${action}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get recent attempts (this would typically use Redis in production)
    const recentAttempts = await this.auditLog.getRecentEventsByAction(identifier, action, windowStart);
    
    return recentAttempts.length < limit;
  }
}

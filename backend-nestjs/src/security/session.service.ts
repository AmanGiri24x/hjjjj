import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly defaultSessionDuration = 24 * 60 * 60 * 1000; // 24 hours
  private readonly idleTimeout = 30 * 60 * 1000; // 30 minutes

  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session
   */
  async createSession(userId: string, ipAddress: string, userAgent: string): Promise<Session> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.defaultSessionDuration);

    // Check for existing sessions and enforce limits
    await this.enforceSessionLimits(userId);

    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId,
        ipAddress,
        userAgent,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        isActive: true,
      },
    });

    this.logger.log(`Session created for user ${userId}: ${sessionId}`);
    return this.mapPrismaSession(session);
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    return session ? this.mapPrismaSession(session) : null;
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.idleTimeout);

    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        lastActivity: now,
        expiresAt,
      },
    });
  }

  /**
   * Invalidate a session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        expiresAt: new Date(), // Set to current time to expire immediately
      },
    });

    this.logger.log(`Session invalidated: ${sessionId}`);
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        expiresAt: new Date(),
      },
    });

    this.logger.log(`All sessions invalidated for user: ${userId}`);
  }

  /**
   * Get active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActivity: 'desc',
      },
    });

    return sessions.map(this.mapPrismaSession);
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} expired sessions`);
    }

    return result.count;
  }

  /**
   * Enforce session limits per user
   */
  private async enforceSessionLimits(userId: string, maxSessions: number = 5): Promise<void> {
    const activeSessions = await this.getUserActiveSessions(userId);
    
    if (activeSessions.length >= maxSessions) {
      // Remove oldest sessions
      const sessionsToRemove = activeSessions
        .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
        .slice(0, activeSessions.length - maxSessions + 1);

      for (const session of sessionsToRemove) {
        await this.invalidateSession(session.id);
      }
    }
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Map Prisma session to our Session interface
   */
  private mapPrismaSession(prismaSession: any): Session {
    return {
      id: prismaSession.id,
      userId: prismaSession.userId,
      ipAddress: prismaSession.ipAddress,
      userAgent: prismaSession.userAgent,
      createdAt: prismaSession.createdAt,
      lastActivity: prismaSession.lastActivity,
      expiresAt: prismaSession.expiresAt,
      isActive: prismaSession.isActive,
    };
  }

  /**
   * Validate session and check for security issues
   */
  async validateSessionSecurity(sessionId: string, currentIp: string): Promise<{
    isValid: boolean;
    reason?: string;
    requiresReauth?: boolean;
  }> {
    const session = await this.getSession(sessionId);

    if (!session) {
      return { isValid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
      return { isValid: false, reason: 'Session inactive' };
    }

    if (session.expiresAt < new Date()) {
      await this.invalidateSession(sessionId);
      return { isValid: false, reason: 'Session expired' };
    }

    // Check for IP address changes (potential session hijacking)
    if (session.ipAddress !== currentIp) {
      await this.invalidateSession(sessionId);
      return { 
        isValid: false, 
        reason: 'IP address mismatch', 
        requiresReauth: true 
      };
    }

    // Check for idle timeout
    const idleTime = Date.now() - session.lastActivity.getTime();
    if (idleTime > this.idleTimeout) {
      await this.invalidateSession(sessionId);
      return { isValid: false, reason: 'Session idle timeout' };
    }

    return { isValid: true };
  }
}

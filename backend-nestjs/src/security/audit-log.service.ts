import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  metadata?: any;
  timestamp: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit event
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
          timestamp: entry.timestamp,
          riskLevel: entry.riskLevel,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get recent events for a user
   */
  async getRecentEvents(userId: string, minutesBack: number): Promise<AuditLogEntry[]> {
    const since = new Date(Date.now() - minutesBack * 60 * 1000);
    
    const logs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: since,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return logs.map(log => ({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      timestamp: log.timestamp,
      riskLevel: log.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    }));
  }

  /**
   * Get recent events by action
   */
  async getRecentEventsByAction(userId: string, action: string, since: number): Promise<AuditLogEntry[]> {
    const sinceDate = new Date(since);
    
    const logs = await this.prisma.auditLog.findMany({
      where: {
        userId,
        action,
        timestamp: {
          gte: sinceDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return logs.map(log => ({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      timestamp: log.timestamp,
      riskLevel: log.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    }));
  }

  /**
   * Get audit logs for compliance reporting
   */
  async getComplianceReport(startDate: Date, endDate: Date, userId?: string): Promise<AuditLogEntry[]> {
    const where: any = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
    });

    return logs.map(log => ({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      timestamp: log.timestamp,
      riskLevel: log.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    }));
  }

  /**
   * Get high-risk events
   */
  async getHighRiskEvents(hours: number = 24): Promise<AuditLogEntry[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const logs = await this.prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: since,
        },
        riskLevel: {
          in: ['HIGH', 'CRITICAL'],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return logs.map(log => ({
      userId: log.userId,
      action: log.action,
      resource: log.resource,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      timestamp: log.timestamp,
      riskLevel: log.riskLevel as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    }));
  }

  /**
   * Clean up old audit logs (for data retention compliance)
   */
  async cleanupOldLogs(retentionDays: number = 2555): Promise<number> { // 7 years default
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old audit log entries`);
    return result.count;
  }
}

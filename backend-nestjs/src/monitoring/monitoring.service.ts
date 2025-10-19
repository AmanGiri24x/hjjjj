import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { MetricsService } from './metrics.service';
import { AlertingService } from './alerting.service';

export interface SystemMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

export interface ApplicationMetrics {
  timestamp: Date;
  activeUsers: number;
  totalTransactions: number;
  failedTransactions: number;
  averageTransactionValue: number;
  complianceAlerts: number;
  securityEvents: number;
  apiCalls: number;
  databaseQueries: number;
}

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  context: string;
  userId?: string;
  requestId?: string;
  metadata: Record<string, any>;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
    private metrics: MetricsService,
    private alerting: AlertingService,
  ) {
    this.startMonitoring();
  }

  /**
   * Start continuous monitoring
   */
  private startMonitoring(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectSystemMetrics();
      this.collectApplicationMetrics();
    }, 60000);

    // Check for alerts every 30 seconds
    setInterval(() => {
      this.checkAlerts();
    }, 30000);

    // Clean up old logs every hour
    setInterval(() => {
      this.cleanupOldLogs();
    }, 3600000);

    this.logger.log('Monitoring service started');
  }

  /**
   * Collect system-level metrics
   */
  async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpuUsage: await this.getCpuUsage(),
        memoryUsage: await this.getMemoryUsage(),
        diskUsage: await this.getDiskUsage(),
        activeConnections: await this.getActiveConnections(),
        responseTime: await this.getAverageResponseTime(),
        errorRate: await this.getErrorRate(),
        throughput: await this.getThroughput(),
      };

      await this.storeSystemMetrics(metrics);
      await this.checkSystemThresholds(metrics);

      return metrics;
    } catch (error) {
      this.logger.error(`Failed to collect system metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Collect application-specific metrics
   */
  async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const [
        activeUsers,
        totalTransactions,
        failedTransactions,
        avgTransactionValue,
        complianceAlerts,
        securityEvents,
        apiCalls,
        databaseQueries,
      ] = await Promise.all([
        this.getActiveUsersCount(),
        this.getTransactionCount(oneHourAgo, now),
        this.getFailedTransactionCount(oneHourAgo, now),
        this.getAverageTransactionValue(oneHourAgo, now),
        this.getComplianceAlertsCount(oneHourAgo, now),
        this.getSecurityEventsCount(oneHourAgo, now),
        this.getApiCallsCount(oneHourAgo, now),
        this.getDatabaseQueriesCount(oneHourAgo, now),
      ]);

      const metrics: ApplicationMetrics = {
        timestamp: now,
        activeUsers,
        totalTransactions,
        failedTransactions,
        averageTransactionValue: avgTransactionValue,
        complianceAlerts,
        securityEvents,
        apiCalls,
        databaseQueries,
      };

      await this.storeApplicationMetrics(metrics);
      await this.checkApplicationThresholds(metrics);

      return metrics;
    } catch (error) {
      this.logger.error(`Failed to collect application metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Log error with context
   */
  async logError(
    level: ErrorLog['level'],
    message: string,
    context: string,
    error?: Error,
    userId?: string,
    requestId?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        id: this.generateId(),
        timestamp: new Date(),
        level,
        message,
        stack: error?.stack,
        context,
        userId,
        requestId,
        metadata,
      };

      await this.storeErrorLog(errorLog);

      // Log to console based on level
      switch (level) {
        case 'error':
          this.logger.error(message, error?.stack, context);
          break;
        case 'warn':
          this.logger.warn(message, context);
          break;
        case 'info':
          this.logger.log(message, context);
          break;
        case 'debug':
          this.logger.debug(message, context);
          break;
      }

      // Check if this error requires immediate alerting
      if (level === 'error') {
        await this.checkErrorAlerts(errorLog);
      }
    } catch (logError) {
      // Fallback logging if database fails
      this.logger.error(`Failed to log error: ${logError.message}`, logError.stack);
      this.logger.error(`Original error: ${message}`, error?.stack, context);
    }
  }

  /**
   * Get monitoring dashboard data
   */
  async getDashboardData(): Promise<{
    systemMetrics: SystemMetrics;
    applicationMetrics: ApplicationMetrics;
    recentErrors: ErrorLog[];
    alerts: any[];
    uptime: number;
    healthStatus: string;
  }> {
    try {
      const [
        systemMetrics,
        applicationMetrics,
        recentErrors,
        alerts,
      ] = await Promise.all([
        this.getLatestSystemMetrics(),
        this.getLatestApplicationMetrics(),
        this.getRecentErrors(50),
        this.alerting.getActiveAlerts(),
      ]);

      return {
        systemMetrics,
        applicationMetrics,
        recentErrors,
        alerts,
        uptime: this.getUptime(),
        healthStatus: this.getHealthStatus(),
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get error statistics
   */
  async getErrorStatistics(timeRange: { start: Date; end: Date }): Promise<{
    totalErrors: number;
    errorsByLevel: Record<string, number>;
    errorsByContext: Record<string, number>;
    errorTrends: Array<{ timestamp: Date; count: number }>;
    topErrors: Array<{ message: string; count: number; lastOccurred: Date }>;
  }> {
    try {
      const errors = await this.prisma.errorLog.findMany({
        where: {
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        orderBy: { timestamp: 'desc' },
      });

      const totalErrors = errors.length;
      
      const errorsByLevel = errors.reduce((acc, error) => {
        acc[error.level] = (acc[error.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const errorsByContext = errors.reduce((acc, error) => {
        acc[error.context] = (acc[error.context] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Group errors by hour for trends
      const errorTrends = this.groupErrorsByHour(errors, timeRange);

      // Get top error messages
      const errorMessageCounts = errors.reduce((acc, error) => {
        const key = error.message;
        if (!acc[key]) {
          acc[key] = { count: 0, lastOccurred: error.timestamp };
        }
        acc[key].count++;
        if (error.timestamp > acc[key].lastOccurred) {
          acc[key].lastOccurred = error.timestamp;
        }
        return acc;
      }, {} as Record<string, { count: number; lastOccurred: Date }>);

      const topErrors = Object.entries(errorMessageCounts)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([message, data]) => ({ message, ...data }));

      return {
        totalErrors,
        errorsByLevel,
        errorsByContext,
        errorTrends,
        topErrors,
      };
    } catch (error) {
      this.logger.error(`Failed to get error statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getCpuUsage(): Promise<number> {
    // In production, integrate with system monitoring tools
    return Math.random() * 100;
  }

  private async getMemoryUsage(): Promise<number> {
    const used = process.memoryUsage();
    return (used.heapUsed / used.heapTotal) * 100;
  }

  private async getDiskUsage(): Promise<number> {
    // In production, check actual disk usage
    return Math.random() * 100;
  }

  private async getActiveConnections(): Promise<number> {
    // In production, get from connection pool
    return Math.floor(Math.random() * 100);
  }

  private async getAverageResponseTime(): Promise<number> {
    // Calculate from recent requests
    return Math.random() * 1000;
  }

  private async getErrorRate(): Promise<number> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const totalRequests = await this.getApiCallsCount(oneHourAgo, now);
    const errorCount = await this.prisma.errorLog.count({
      where: {
        timestamp: { gte: oneHourAgo, lte: now },
        level: 'error',
      },
    });

    return totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
  }

  private async getThroughput(): Promise<number> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    return await this.getApiCallsCount(oneMinuteAgo, now);
  }

  private async getActiveUsersCount(): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return await this.prisma.session.count({
      where: {
        lastActivity: { gte: fifteenMinutesAgo },
        isActive: true,
      },
    });
  }

  private async getTransactionCount(start: Date, end: Date): Promise<number> {
    return await this.prisma.transaction.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });
  }

  private async getFailedTransactionCount(start: Date, end: Date): Promise<number> {
    return await this.prisma.transaction.count({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'failed',
      },
    });
  }

  private async getAverageTransactionValue(start: Date, end: Date): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        status: 'completed',
      },
      _avg: { amount: true },
    });
    return result._avg.amount || 0;
  }

  private async getComplianceAlertsCount(start: Date, end: Date): Promise<number> {
    return await this.prisma.suspiciousActivityReport.count({
      where: {
        reportedAt: { gte: start, lte: end },
      },
    });
  }

  private async getSecurityEventsCount(start: Date, end: Date): Promise<number> {
    return await this.prisma.securityEvent.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });
  }

  private async getApiCallsCount(start: Date, end: Date): Promise<number> {
    // In production, get from API gateway or request logs
    return Math.floor(Math.random() * 1000);
  }

  private async getDatabaseQueriesCount(start: Date, end: Date): Promise<number> {
    // In production, get from database monitoring
    return Math.floor(Math.random() * 5000);
  }

  private async storeSystemMetrics(metrics: SystemMetrics): Promise<void> {
    await this.prisma.systemMetrics.create({
      data: {
        timestamp: metrics.timestamp,
        cpuUsage: metrics.cpuUsage,
        memoryUsage: metrics.memoryUsage,
        diskUsage: metrics.diskUsage,
        activeConnections: metrics.activeConnections,
        responseTime: metrics.responseTime,
        errorRate: metrics.errorRate,
        throughput: metrics.throughput,
      },
    });
  }

  private async storeApplicationMetrics(metrics: ApplicationMetrics): Promise<void> {
    await this.prisma.applicationMetrics.create({
      data: {
        timestamp: metrics.timestamp,
        activeUsers: metrics.activeUsers,
        totalTransactions: metrics.totalTransactions,
        failedTransactions: metrics.failedTransactions,
        averageTransactionValue: metrics.averageTransactionValue,
        complianceAlerts: metrics.complianceAlerts,
        securityEvents: metrics.securityEvents,
        apiCalls: metrics.apiCalls,
        databaseQueries: metrics.databaseQueries,
      },
    });
  }

  private async storeErrorLog(errorLog: ErrorLog): Promise<void> {
    await this.prisma.errorLog.create({
      data: {
        id: errorLog.id,
        timestamp: errorLog.timestamp,
        level: errorLog.level,
        message: errorLog.message,
        stack: errorLog.stack,
        context: errorLog.context,
        userId: errorLog.userId,
        requestId: errorLog.requestId,
        metadata: errorLog.metadata,
      },
    });
  }

  private async checkSystemThresholds(metrics: SystemMetrics): Promise<void> {
    const thresholds = {
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90,
      responseTime: 2000,
      errorRate: 5,
    };

    if (metrics.cpuUsage > thresholds.cpuUsage) {
      await this.alerting.createAlert('HIGH_CPU_USAGE', 'high', `CPU usage is ${metrics.cpuUsage}%`);
    }

    if (metrics.memoryUsage > thresholds.memoryUsage) {
      await this.alerting.createAlert('HIGH_MEMORY_USAGE', 'high', `Memory usage is ${metrics.memoryUsage}%`);
    }

    if (metrics.diskUsage > thresholds.diskUsage) {
      await this.alerting.createAlert('HIGH_DISK_USAGE', 'critical', `Disk usage is ${metrics.diskUsage}%`);
    }

    if (metrics.responseTime > thresholds.responseTime) {
      await this.alerting.createAlert('HIGH_RESPONSE_TIME', 'medium', `Response time is ${metrics.responseTime}ms`);
    }

    if (metrics.errorRate > thresholds.errorRate) {
      await this.alerting.createAlert('HIGH_ERROR_RATE', 'high', `Error rate is ${metrics.errorRate}%`);
    }
  }

  private async checkApplicationThresholds(metrics: ApplicationMetrics): Promise<void> {
    const failureRate = metrics.totalTransactions > 0 
      ? (metrics.failedTransactions / metrics.totalTransactions) * 100 
      : 0;

    if (failureRate > 10) {
      await this.alerting.createAlert(
        'HIGH_TRANSACTION_FAILURE_RATE',
        'high',
        `Transaction failure rate is ${failureRate.toFixed(2)}%`
      );
    }

    if (metrics.complianceAlerts > 5) {
      await this.alerting.createAlert(
        'HIGH_COMPLIANCE_ALERTS',
        'high',
        `${metrics.complianceAlerts} compliance alerts in the last hour`
      );
    }

    if (metrics.securityEvents > 10) {
      await this.alerting.createAlert(
        'HIGH_SECURITY_EVENTS',
        'critical',
        `${metrics.securityEvents} security events in the last hour`
      );
    }
  }

  private async checkAlerts(): Promise<void> {
    // Check for error patterns that require alerting
    const recentErrors = await this.getRecentErrors(100);
    const errorPatterns = this.analyzeErrorPatterns(recentErrors);

    for (const pattern of errorPatterns) {
      if (pattern.count > pattern.threshold) {
        await this.alerting.createAlert(
          'ERROR_PATTERN_DETECTED',
          'medium',
          `Error pattern detected: ${pattern.message} (${pattern.count} occurrences)`
        );
      }
    }
  }

  private async checkErrorAlerts(errorLog: ErrorLog): Promise<void> {
    // Check for critical errors that need immediate attention
    const criticalKeywords = ['database', 'payment', 'security', 'compliance', 'auth'];
    const isCritical = criticalKeywords.some(keyword => 
      errorLog.message.toLowerCase().includes(keyword) ||
      errorLog.context.toLowerCase().includes(keyword)
    );

    if (isCritical) {
      await this.alerting.createAlert(
        'CRITICAL_ERROR',
        'critical',
        `Critical error in ${errorLog.context}: ${errorLog.message}`,
        { errorId: errorLog.id }
      );
    }
  }

  private async getLatestSystemMetrics(): Promise<SystemMetrics> {
    const latest = await this.prisma.systemMetrics.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    return latest || {
      timestamp: new Date(),
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0,
      activeConnections: 0,
      responseTime: 0,
      errorRate: 0,
      throughput: 0,
    };
  }

  private async getLatestApplicationMetrics(): Promise<ApplicationMetrics> {
    const latest = await this.prisma.applicationMetrics.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    return latest || {
      timestamp: new Date(),
      activeUsers: 0,
      totalTransactions: 0,
      failedTransactions: 0,
      averageTransactionValue: 0,
      complianceAlerts: 0,
      securityEvents: 0,
      apiCalls: 0,
      databaseQueries: 0,
    };
  }

  private async getRecentErrors(limit: number): Promise<ErrorLog[]> {
    const errors = await this.prisma.errorLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return errors.map(error => ({
      id: error.id,
      timestamp: error.timestamp,
      level: error.level as ErrorLog['level'],
      message: error.message,
      stack: error.stack,
      context: error.context,
      userId: error.userId,
      requestId: error.requestId,
      metadata: error.metadata as Record<string, any>,
    }));
  }

  private analyzeErrorPatterns(errors: ErrorLog[]): Array<{
    message: string;
    count: number;
    threshold: number;
  }> {
    const patterns = errors.reduce((acc, error) => {
      const key = error.message;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(patterns).map(([message, count]) => ({
      message,
      count,
      threshold: 5, // Alert if same error occurs 5+ times
    }));
  }

  private groupErrorsByHour(errors: ErrorLog[], timeRange: { start: Date; end: Date }): Array<{
    timestamp: Date;
    count: number;
  }> {
    const hours: Record<string, number> = {};
    
    // Initialize all hours in range
    const current = new Date(timeRange.start);
    while (current <= timeRange.end) {
      const hourKey = current.toISOString().slice(0, 13) + ':00:00.000Z';
      hours[hourKey] = 0;
      current.setHours(current.getHours() + 1);
    }

    // Count errors by hour
    errors.forEach(error => {
      const hourKey = error.timestamp.toISOString().slice(0, 13) + ':00:00.000Z';
      if (hours[hourKey] !== undefined) {
        hours[hourKey]++;
      }
    });

    return Object.entries(hours).map(([timestamp, count]) => ({
      timestamp: new Date(timestamp),
      count,
    }));
  }

  private async cleanupOldLogs(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    await Promise.all([
      this.prisma.errorLog.deleteMany({
        where: { timestamp: { lt: thirtyDaysAgo } },
      }),
      this.prisma.systemMetrics.deleteMany({
        where: { timestamp: { lt: thirtyDaysAgo } },
      }),
      this.prisma.applicationMetrics.deleteMany({
        where: { timestamp: { lt: thirtyDaysAgo } },
      }),
    ]);

    this.logger.log('Cleaned up old monitoring data');
  }

  private getUptime(): number {
    return process.uptime();
  }

  private getHealthStatus(): string {
    // Simple health check - in production, check all dependencies
    return 'healthy';
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

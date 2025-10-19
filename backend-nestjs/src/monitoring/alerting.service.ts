import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';

export interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  enabled: boolean;
}

@Injectable()
export class AlertingService {
  private readonly logger = new Logger(AlertingService.name);
  private notificationChannels: NotificationChannel[] = [];

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
  ) {
    this.initializeNotificationChannels();
  }

  /**
   * Create a new alert
   */
  async createAlert(
    type: string,
    severity: Alert['severity'],
    message: string,
    metadata: Record<string, any> = {}
  ): Promise<Alert> {
    try {
      const alert: Alert = {
        id: this.generateId(),
        type,
        severity,
        message,
        metadata,
        createdAt: new Date(),
        status: 'active',
      };

      await this.storeAlert(alert);
      await this.sendNotifications(alert);

      // Log security event for high/critical alerts
      if (severity === 'high' || severity === 'critical') {
        await this.security.logSecurityEvent({
          userId: 'system',
          action: 'ALERT_CREATED',
          resource: 'monitoring',
          ipAddress: 'system',
          userAgent: '',
          metadata: {
            alertId: alert.id,
            alertType: type,
            severity,
            message,
          },
          riskLevel: severity === 'critical' ? 'HIGH' : 'MEDIUM',
        });
      }

      this.logger.warn(`Alert created: ${type} - ${message}`, { alertId: alert.id, severity });

      return alert;
    } catch (error) {
      this.logger.error(`Failed to create alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          status: 'acknowledged',
          acknowledgedBy,
          acknowledgedAt: new Date(),
        },
      });

      this.logger.log(`Alert acknowledged: ${alertId} by ${acknowledgedBy}`);
    } catch (error) {
      this.logger.error(`Failed to acknowledge alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolvedBy: string, resolution?: string): Promise<void> {
    try {
      await this.prisma.alert.update({
        where: { id: alertId },
        data: {
          status: 'resolved',
          resolvedBy,
          resolvedAt: new Date(),
          resolution,
        },
      });

      this.logger.log(`Alert resolved: ${alertId} by ${resolvedBy}`);
    } catch (error) {
      this.logger.error(`Failed to resolve alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const alerts = await this.prisma.alert.findMany({
        where: { status: { in: ['active', 'acknowledged'] } },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return alerts.map(this.mapPrismaAlert);
    } catch (error) {
      this.logger.error(`Failed to get active alerts: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(
    filters: {
      type?: string;
      severity?: Alert['severity'];
      status?: Alert['status'];
      startDate?: Date;
      endDate?: Date;
    } = {},
    limit: number = 100
  ): Promise<Alert[]> {
    try {
      const where: any = {};

      if (filters.type) where.type = filters.type;
      if (filters.severity) where.severity = filters.severity;
      if (filters.status) where.status = filters.status;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      const alerts = await this.prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return alerts.map(this.mapPrismaAlert);
    } catch (error) {
      this.logger.error(`Failed to get alert history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(timeRange: { start: Date; end: Date }): Promise<{
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByType: Record<string, number>;
    alertsByStatus: Record<string, number>;
    averageResolutionTime: number;
    alertTrends: Array<{ timestamp: Date; count: number }>;
  }> {
    try {
      const alerts = await this.prisma.alert.findMany({
        where: {
          createdAt: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      });

      const totalAlerts = alerts.length;

      const alertsBySeverity = alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertsByType = alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const alertsByStatus = alerts.reduce((acc, alert) => {
        acc[alert.status] = (acc[alert.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate average resolution time for resolved alerts
      const resolvedAlerts = alerts.filter(alert => alert.resolvedAt);
      const averageResolutionTime = resolvedAlerts.length > 0
        ? resolvedAlerts.reduce((sum, alert) => {
            const resolutionTime = alert.resolvedAt!.getTime() - alert.createdAt.getTime();
            return sum + resolutionTime;
          }, 0) / resolvedAlerts.length / (1000 * 60) // Convert to minutes
        : 0;

      // Group alerts by hour for trends
      const alertTrends = this.groupAlertsByHour(alerts, timeRange);

      return {
        totalAlerts,
        alertsBySeverity,
        alertsByType,
        alertsByStatus,
        averageResolutionTime,
        alertTrends,
      };
    } catch (error) {
      this.logger.error(`Failed to get alert statistics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Configure notification channels
   */
  async configureNotificationChannel(channel: NotificationChannel): Promise<void> {
    try {
      const existingIndex = this.notificationChannels.findIndex(c => c.type === channel.type);
      
      if (existingIndex >= 0) {
        this.notificationChannels[existingIndex] = channel;
      } else {
        this.notificationChannels.push(channel);
      }

      // Store in database
      await this.prisma.notificationChannel.upsert({
        where: { type: channel.type },
        update: {
          config: channel.config,
          enabled: channel.enabled,
        },
        create: {
          type: channel.type,
          config: channel.config,
          enabled: channel.enabled,
        },
      });

      this.logger.log(`Notification channel configured: ${channel.type}`);
    } catch (error) {
      this.logger.error(`Failed to configure notification channel: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Test notification channel
   */
  async testNotificationChannel(channelType: string): Promise<boolean> {
    try {
      const channel = this.notificationChannels.find(c => c.type === channelType);
      if (!channel) {
        throw new Error(`Notification channel not found: ${channelType}`);
      }

      const testAlert: Alert = {
        id: 'test-alert',
        type: 'TEST_ALERT',
        severity: 'low',
        message: 'This is a test alert to verify notification channel configuration',
        createdAt: new Date(),
        status: 'active',
      };

      await this.sendNotificationToChannel(channel, testAlert);
      return true;
    } catch (error) {
      this.logger.error(`Failed to test notification channel: ${error.message}`, error.stack);
      return false;
    }
  }

  private async initializeNotificationChannels(): Promise<void> {
    try {
      const channels = await this.prisma.notificationChannel.findMany({
        where: { enabled: true },
      });

      this.notificationChannels = channels.map(channel => ({
        type: channel.type as NotificationChannel['type'],
        config: channel.config as Record<string, any>,
        enabled: channel.enabled,
      }));

      this.logger.log(`Initialized ${this.notificationChannels.length} notification channels`);
    } catch (error) {
      this.logger.error(`Failed to initialize notification channels: ${error.message}`, error.stack);
    }
  }

  private async storeAlert(alert: Alert): Promise<void> {
    await this.prisma.alert.create({
      data: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        metadata: alert.metadata || {},
        createdAt: alert.createdAt,
        status: alert.status,
      },
    });
  }

  private async sendNotifications(alert: Alert): Promise<void> {
    const enabledChannels = this.notificationChannels.filter(c => c.enabled);
    
    // Only send notifications for medium, high, and critical alerts
    if (alert.severity === 'low') {
      return;
    }

    const notificationPromises = enabledChannels.map(channel =>
      this.sendNotificationToChannel(channel, alert).catch(error => {
        this.logger.error(`Failed to send notification via ${channel.type}: ${error.message}`);
      })
    );

    await Promise.allSettled(notificationPromises);
  }

  private async sendNotificationToChannel(channel: NotificationChannel, alert: Alert): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmailNotification(channel.config, alert);
        break;
      case 'slack':
        await this.sendSlackNotification(channel.config, alert);
        break;
      case 'webhook':
        await this.sendWebhookNotification(channel.config, alert);
        break;
      case 'sms':
        await this.sendSmsNotification(channel.config, alert);
        break;
      default:
        this.logger.warn(`Unknown notification channel type: ${channel.type}`);
    }
  }

  private async sendEmailNotification(config: any, alert: Alert): Promise<void> {
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    this.logger.log(`Email notification sent for alert: ${alert.id}`);
  }

  private async sendSlackNotification(config: any, alert: Alert): Promise<void> {
    // In production, integrate with Slack API
    this.logger.log(`Slack notification sent for alert: ${alert.id}`);
  }

  private async sendWebhookNotification(config: any, alert: Alert): Promise<void> {
    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify({
          alert,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      this.logger.log(`Webhook notification sent for alert: ${alert.id}`);
    } catch (error) {
      this.logger.error(`Failed to send webhook notification: ${error.message}`);
      throw error;
    }
  }

  private async sendSmsNotification(config: any, alert: Alert): Promise<void> {
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    this.logger.log(`SMS notification sent for alert: ${alert.id}`);
  }

  private mapPrismaAlert(prismaAlert: any): Alert {
    return {
      id: prismaAlert.id,
      type: prismaAlert.type,
      severity: prismaAlert.severity,
      message: prismaAlert.message,
      metadata: prismaAlert.metadata,
      createdAt: prismaAlert.createdAt,
      resolvedAt: prismaAlert.resolvedAt,
      resolvedBy: prismaAlert.resolvedBy,
      status: prismaAlert.status,
    };
  }

  private groupAlertsByHour(alerts: any[], timeRange: { start: Date; end: Date }): Array<{
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

    // Count alerts by hour
    alerts.forEach(alert => {
      const hourKey = alert.createdAt.toISOString().slice(0, 13) + ':00:00.000Z';
      if (hours[hourKey] !== undefined) {
        hours[hourKey]++;
      }
    });

    return Object.entries(hours).map(([timestamp, count]) => ({
      timestamp: new Date(timestamp),
      count,
    }));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

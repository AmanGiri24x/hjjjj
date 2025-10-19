import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MetricPoint {
  timestamp: Date;
  value: number;
  tags?: Record<string, string>;
}

export interface TimeSeriesData {
  metric: string;
  points: MetricPoint[];
}

export interface PerformanceMetrics {
  responseTime: {
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errorRate: {
    percentage: number;
    count: number;
  };
  availability: {
    percentage: number;
    uptime: number;
  };
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private metricsBuffer: Map<string, MetricPoint[]> = new Map();
  private readonly bufferSize = 1000;

  constructor(private prisma: PrismaService) {
    this.startMetricsFlush();
  }

  /**
   * Record a metric point
   */
  recordMetric(
    metric: string,
    value: number,
    tags: Record<string, string> = {}
  ): void {
    const point: MetricPoint = {
      timestamp: new Date(),
      value,
      tags,
    };

    if (!this.metricsBuffer.has(metric)) {
      this.metricsBuffer.set(metric, []);
    }

    const buffer = this.metricsBuffer.get(metric)!;
    buffer.push(point);

    // Keep buffer size manageable
    if (buffer.length > this.bufferSize) {
      buffer.shift();
    }
  }

  /**
   * Record response time metric
   */
  recordResponseTime(endpoint: string, method: string, responseTime: number): void {
    this.recordMetric('http_request_duration', responseTime, {
      endpoint,
      method,
    });
  }

  /**
   * Record error metric
   */
  recordError(endpoint: string, method: string, statusCode: number): void {
    this.recordMetric('http_request_errors', 1, {
      endpoint,
      method,
      status_code: statusCode.toString(),
    });
  }

  /**
   * Record business metric
   */
  recordBusinessMetric(metric: string, value: number, userId?: string): void {
    const tags: Record<string, string> = {};
    if (userId) tags.user_id = userId;

    this.recordMetric(`business_${metric}`, value, tags);
  }

  /**
   * Get time series data for a metric
   */
  async getTimeSeriesData(
    metric: string,
    timeRange: { start: Date; end: Date },
    granularity: 'minute' | 'hour' | 'day' = 'hour'
  ): Promise<TimeSeriesData> {
    try {
      const metrics = await this.prisma.metric.findMany({
        where: {
          name: metric,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Group by time granularity
      const groupedData = this.groupMetricsByTime(metrics, granularity);

      return {
        metric,
        points: groupedData,
      };
    } catch (error) {
      this.logger.error(`Failed to get time series data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get performance metrics for a time range
   */
  async getPerformanceMetrics(timeRange: { start: Date; end: Date }): Promise<PerformanceMetrics> {
    try {
      const [responseTimes, requestCounts, errorCounts] = await Promise.all([
        this.getResponseTimeMetrics(timeRange),
        this.getRequestCountMetrics(timeRange),
        this.getErrorCountMetrics(timeRange),
      ]);

      const totalRequests = requestCounts.reduce((sum, point) => sum + point.value, 0);
      const totalErrors = errorCounts.reduce((sum, point) => sum + point.value, 0);
      const timeRangeMinutes = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60);

      return {
        responseTime: {
          avg: this.calculateAverage(responseTimes),
          p50: this.calculatePercentile(responseTimes, 50),
          p95: this.calculatePercentile(responseTimes, 95),
          p99: this.calculatePercentile(responseTimes, 99),
        },
        throughput: {
          requestsPerSecond: totalRequests / (timeRangeMinutes * 60),
          requestsPerMinute: totalRequests / timeRangeMinutes,
        },
        errorRate: {
          percentage: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
          count: totalErrors,
        },
        availability: {
          percentage: this.calculateAvailability(timeRange),
          uptime: process.uptime(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get performance metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get business metrics dashboard
   */
  async getBusinessMetrics(timeRange: { start: Date; end: Date }): Promise<{
    userSignups: number;
    activeUsers: number;
    transactionVolume: number;
    transactionValue: number;
    conversionRate: number;
    churnRate: number;
  }> {
    try {
      const [
        userSignups,
        activeUsers,
        transactions,
        userMetrics,
      ] = await Promise.all([
        this.getUserSignupsCount(timeRange),
        this.getActiveUsersCount(timeRange),
        this.getTransactionMetrics(timeRange),
        this.getUserRetentionMetrics(timeRange),
      ]);

      return {
        userSignups,
        activeUsers,
        transactionVolume: transactions.volume,
        transactionValue: transactions.value,
        conversionRate: userMetrics.conversionRate,
        churnRate: userMetrics.churnRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get business metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get custom dashboard metrics
   */
  async getCustomMetrics(metricNames: string[], timeRange: { start: Date; end: Date }): Promise<{
    [metricName: string]: {
      current: number;
      previous: number;
      change: number;
      trend: MetricPoint[];
    };
  }> {
    try {
      const results: any = {};

      for (const metricName of metricNames) {
        const [current, previous, trend] = await Promise.all([
          this.getCurrentMetricValue(metricName, timeRange),
          this.getPreviousMetricValue(metricName, timeRange),
          this.getMetricTrend(metricName, timeRange),
        ]);

        const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        results[metricName] = {
          current,
          previous,
          change,
          trend,
        };
      }

      return results;
    } catch (error) {
      this.logger.error(`Failed to get custom metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export metrics data
   */
  async exportMetrics(
    metricNames: string[],
    timeRange: { start: Date; end: Date },
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const data: any = {};

      for (const metricName of metricNames) {
        const timeSeriesData = await this.getTimeSeriesData(metricName, timeRange);
        data[metricName] = timeSeriesData.points;
      }

      if (format === 'csv') {
        return this.convertToCSV(data);
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      this.logger.error(`Failed to export metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private startMetricsFlush(): void {
    // Flush metrics to database every 30 seconds
    setInterval(() => {
      this.flushMetricsToDatabase();
    }, 30000);
  }

  private async flushMetricsToDatabase(): Promise<void> {
    try {
      const metricsToFlush: any[] = [];

      for (const [metricName, points] of this.metricsBuffer.entries()) {
        if (points.length === 0) continue;

        for (const point of points) {
          metricsToFlush.push({
            name: metricName,
            timestamp: point.timestamp,
            value: point.value,
            tags: point.tags || {},
          });
        }

        // Clear the buffer
        points.length = 0;
      }

      if (metricsToFlush.length > 0) {
        await this.prisma.metric.createMany({
          data: metricsToFlush,
        });

        this.logger.debug(`Flushed ${metricsToFlush.length} metrics to database`);
      }
    } catch (error) {
      this.logger.error(`Failed to flush metrics to database: ${error.message}`, error.stack);
    }
  }

  private groupMetricsByTime(
    metrics: any[],
    granularity: 'minute' | 'hour' | 'day'
  ): MetricPoint[] {
    const grouped: Record<string, { sum: number; count: number; timestamp: Date }> = {};

    for (const metric of metrics) {
      let timeKey: string;
      const timestamp = new Date(metric.timestamp);

      switch (granularity) {
        case 'minute':
          timestamp.setSeconds(0, 0);
          timeKey = timestamp.toISOString();
          break;
        case 'hour':
          timestamp.setMinutes(0, 0, 0);
          timeKey = timestamp.toISOString();
          break;
        case 'day':
          timestamp.setHours(0, 0, 0, 0);
          timeKey = timestamp.toISOString();
          break;
      }

      if (!grouped[timeKey]) {
        grouped[timeKey] = { sum: 0, count: 0, timestamp };
      }

      grouped[timeKey].sum += metric.value;
      grouped[timeKey].count += 1;
    }

    return Object.values(grouped).map(group => ({
      timestamp: group.timestamp,
      value: group.sum / group.count, // Average value
    }));
  }

  private async getResponseTimeMetrics(timeRange: { start: Date; end: Date }): Promise<MetricPoint[]> {
    const metrics = await this.prisma.metric.findMany({
      where: {
        name: 'http_request_duration',
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });

    return metrics.map(metric => ({
      timestamp: metric.timestamp,
      value: metric.value,
    }));
  }

  private async getRequestCountMetrics(timeRange: { start: Date; end: Date }): Promise<MetricPoint[]> {
    // In production, get actual request counts
    return [];
  }

  private async getErrorCountMetrics(timeRange: { start: Date; end: Date }): Promise<MetricPoint[]> {
    const metrics = await this.prisma.metric.findMany({
      where: {
        name: 'http_request_errors',
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });

    return metrics.map(metric => ({
      timestamp: metric.timestamp,
      value: metric.value,
    }));
  }

  private calculateAverage(points: MetricPoint[]): number {
    if (points.length === 0) return 0;
    const sum = points.reduce((acc, point) => acc + point.value, 0);
    return sum / points.length;
  }

  private calculatePercentile(points: MetricPoint[], percentile: number): number {
    if (points.length === 0) return 0;
    
    const sorted = points.map(p => p.value).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateAvailability(timeRange: { start: Date; end: Date }): number {
    // In production, calculate based on actual uptime/downtime
    return 99.9;
  }

  private async getUserSignupsCount(timeRange: { start: Date; end: Date }): Promise<number> {
    return await this.prisma.user.count({
      where: {
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
    });
  }

  private async getActiveUsersCount(timeRange: { start: Date; end: Date }): Promise<number> {
    return await this.prisma.session.count({
      where: {
        lastActivity: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
        isActive: true,
      },
      distinct: ['userId'],
    });
  }

  private async getTransactionMetrics(timeRange: { start: Date; end: Date }): Promise<{
    volume: number;
    value: number;
  }> {
    const result = await this.prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
        status: 'completed',
      },
      _count: true,
      _sum: { amount: true },
    });

    return {
      volume: result._count,
      value: result._sum.amount || 0,
    };
  }

  private async getUserRetentionMetrics(timeRange: { start: Date; end: Date }): Promise<{
    conversionRate: number;
    churnRate: number;
  }> {
    // Simplified calculation - in production, implement proper cohort analysis
    return {
      conversionRate: 15.5,
      churnRate: 3.2,
    };
  }

  private async getCurrentMetricValue(metricName: string, timeRange: { start: Date; end: Date }): Promise<number> {
    const result = await this.prisma.metric.aggregate({
      where: {
        name: metricName,
        timestamp: {
          gte: timeRange.start,
          lte: timeRange.end,
        },
      },
      _avg: { value: true },
    });

    return result._avg.value || 0;
  }

  private async getPreviousMetricValue(metricName: string, timeRange: { start: Date; end: Date }): Promise<number> {
    const duration = timeRange.end.getTime() - timeRange.start.getTime();
    const previousStart = new Date(timeRange.start.getTime() - duration);
    const previousEnd = new Date(timeRange.end.getTime() - duration);

    const result = await this.prisma.metric.aggregate({
      where: {
        name: metricName,
        timestamp: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
      _avg: { value: true },
    });

    return result._avg.value || 0;
  }

  private async getMetricTrend(metricName: string, timeRange: { start: Date; end: Date }): Promise<MetricPoint[]> {
    const timeSeriesData = await this.getTimeSeriesData(metricName, timeRange, 'hour');
    return timeSeriesData.points;
  }

  private convertToCSV(data: any): string {
    const rows: string[] = [];
    rows.push('metric,timestamp,value');

    for (const [metricName, points] of Object.entries(data)) {
      for (const point of points as MetricPoint[]) {
        rows.push(`${metricName},${point.timestamp.toISOString()},${point.value}`);
      }
    }

    return rows.join('\n');
  }
}

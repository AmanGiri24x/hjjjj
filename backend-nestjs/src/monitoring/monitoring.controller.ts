import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MonitoringService } from './monitoring.service';
import { AlertingService } from './alerting.service';
import { MetricsService } from './metrics.service';

@ApiTags('monitoring')
@Controller('monitoring')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(
    private readonly monitoring: MonitoringService,
    private readonly alerting: AlertingService,
    private readonly metrics: MetricsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get monitoring dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard() {
    try {
      return await this.monitoring.getDashboardData();
    } catch (error) {
      throw new HttpException(
        'Failed to get dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics/system')
  @ApiOperation({ summary: 'Get system metrics' })
  @ApiResponse({ status: 200, description: 'System metrics retrieved successfully' })
  async getSystemMetrics() {
    try {
      return await this.monitoring.collectSystemMetrics();
    } catch (error) {
      throw new HttpException(
        'Failed to get system metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics/application')
  @ApiOperation({ summary: 'Get application metrics' })
  @ApiResponse({ status: 200, description: 'Application metrics retrieved successfully' })
  async getApplicationMetrics() {
    try {
      return await this.monitoring.collectApplicationMetrics();
    } catch (error) {
      throw new HttpException(
        'Failed to get application metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics/performance')
  @ApiOperation({ summary: 'Get performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  @ApiQuery({ name: 'start', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, description: 'End date (ISO string)' })
  async getPerformanceMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    try {
      const timeRange = {
        start: start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: end ? new Date(end) : new Date(),
      };

      return await this.metrics.getPerformanceMetrics(timeRange);
    } catch (error) {
      throw new HttpException(
        'Failed to get performance metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics/business')
  @ApiOperation({ summary: 'Get business metrics' })
  @ApiResponse({ status: 200, description: 'Business metrics retrieved successfully' })
  @ApiQuery({ name: 'start', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, description: 'End date (ISO string)' })
  async getBusinessMetrics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    try {
      const timeRange = {
        start: start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: end ? new Date(end) : new Date(),
      };

      return await this.metrics.getBusinessMetrics(timeRange);
    } catch (error) {
      throw new HttpException(
        'Failed to get business metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics/timeseries/:metric')
  @ApiOperation({ summary: 'Get time series data for a metric' })
  @ApiResponse({ status: 200, description: 'Time series data retrieved successfully' })
  @ApiQuery({ name: 'start', required: true, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: true, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'granularity', required: false, enum: ['minute', 'hour', 'day'] })
  async getTimeSeriesData(
    @Param('metric') metric: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('granularity') granularity: 'minute' | 'hour' | 'day' = 'hour',
  ) {
    try {
      const timeRange = {
        start: new Date(start),
        end: new Date(end),
      };

      return await this.metrics.getTimeSeriesData(metric, timeRange, granularity);
    } catch (error) {
      throw new HttpException(
        'Failed to get time series data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('errors')
  @ApiOperation({ summary: 'Get error logs' })
  @ApiResponse({ status: 200, description: 'Error logs retrieved successfully' })
  @ApiQuery({ name: 'start', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, description: 'End date (ISO string)' })
  async getErrorLogs(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    try {
      const timeRange = {
        start: start ? new Date(start) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: end ? new Date(end) : new Date(),
      };

      return await this.monitoring.getErrorStatistics(timeRange);
    } catch (error) {
      throw new HttpException(
        'Failed to get error logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('errors/log')
  @ApiOperation({ summary: 'Log an error' })
  @ApiResponse({ status: 201, description: 'Error logged successfully' })
  async logError(@Request() req, @Body() errorData: {
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    context: string;
    stack?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await this.monitoring.logError(
        errorData.level,
        errorData.message,
        errorData.context,
        errorData.stack ? new Error(errorData.stack) : undefined,
        req.user?.id,
        req.headers['x-request-id'],
        errorData.metadata || {}
      );

      return { message: 'Error logged successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to log error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active alerts' })
  @ApiResponse({ status: 200, description: 'Active alerts retrieved successfully' })
  async getActiveAlerts() {
    try {
      return await this.alerting.getActiveAlerts();
    } catch (error) {
      throw new HttpException(
        'Failed to get active alerts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('alerts/history')
  @ApiOperation({ summary: 'Get alert history' })
  @ApiResponse({ status: 200, description: 'Alert history retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, description: 'Alert type filter' })
  @ApiQuery({ name: 'severity', required: false, enum: ['low', 'medium', 'high', 'critical'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'acknowledged', 'resolved'] })
  @ApiQuery({ name: 'start', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of results' })
  async getAlertHistory(
    @Query('type') type?: string,
    @Query('severity') severity?: 'low' | 'medium' | 'high' | 'critical',
    @Query('status') status?: 'active' | 'acknowledged' | 'resolved',
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const filters: any = {};
      if (type) filters.type = type;
      if (severity) filters.severity = severity;
      if (status) filters.status = status;
      if (start) filters.startDate = new Date(start);
      if (end) filters.endDate = new Date(end);

      const limitNum = limit ? parseInt(limit, 10) : 100;

      return await this.alerting.getAlertHistory(filters, limitNum);
    } catch (error) {
      throw new HttpException(
        'Failed to get alert history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('alerts/statistics')
  @ApiOperation({ summary: 'Get alert statistics' })
  @ApiResponse({ status: 200, description: 'Alert statistics retrieved successfully' })
  @ApiQuery({ name: 'start', required: false, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: false, description: 'End date (ISO string)' })
  async getAlertStatistics(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    try {
      const timeRange = {
        start: start ? new Date(start) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: end ? new Date(end) : new Date(),
      };

      return await this.alerting.getAlertStatistics(timeRange);
    } catch (error) {
      throw new HttpException(
        'Failed to get alert statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('alerts')
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  async createAlert(@Body() alertData: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metadata?: Record<string, any>;
  }) {
    try {
      return await this.alerting.createAlert(
        alertData.type,
        alertData.severity,
        alertData.message,
        alertData.metadata || {}
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create alert',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('alerts/:alertId/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  @ApiResponse({ status: 200, description: 'Alert acknowledged successfully' })
  async acknowledgeAlert(@Request() req, @Param('alertId') alertId: string) {
    try {
      await this.alerting.acknowledgeAlert(alertId, req.user.id);
      return { message: 'Alert acknowledged successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to acknowledge alert',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('alerts/:alertId/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  @ApiResponse({ status: 200, description: 'Alert resolved successfully' })
  async resolveAlert(@Request() req, @Param('alertId') alertId: string, @Body() resolutionData: {
    resolution?: string;
  }) {
    try {
      await this.alerting.resolveAlert(alertId, req.user.id, resolutionData.resolution);
      return { message: 'Alert resolved successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to resolve alert',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('metrics/record')
  @ApiOperation({ summary: 'Record a custom metric' })
  @ApiResponse({ status: 201, description: 'Metric recorded successfully' })
  async recordMetric(@Body() metricData: {
    metric: string;
    value: number;
    tags?: Record<string, string>;
  }) {
    try {
      this.metrics.recordMetric(metricData.metric, metricData.value, metricData.tags || {});
      return { message: 'Metric recorded successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to record metric',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics/export')
  @ApiOperation({ summary: 'Export metrics data' })
  @ApiResponse({ status: 200, description: 'Metrics exported successfully' })
  @ApiQuery({ name: 'metrics', required: true, description: 'Comma-separated list of metric names' })
  @ApiQuery({ name: 'start', required: true, description: 'Start date (ISO string)' })
  @ApiQuery({ name: 'end', required: true, description: 'End date (ISO string)' })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'csv'] })
  async exportMetrics(
    @Query('metrics') metrics: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('format') format: 'json' | 'csv' = 'json',
  ) {
    try {
      const metricNames = metrics.split(',').map(m => m.trim());
      const timeRange = {
        start: new Date(start),
        end: new Date(end),
      };

      const exportData = await this.metrics.exportMetrics(metricNames, timeRange, format);

      return {
        data: exportData,
        format,
        exportedAt: new Date().toISOString(),
        metrics: metricNames,
        timeRange,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to export metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('notifications/configure')
  @ApiOperation({ summary: 'Configure notification channel' })
  @ApiResponse({ status: 201, description: 'Notification channel configured successfully' })
  async configureNotificationChannel(@Body() channelData: {
    type: 'email' | 'slack' | 'webhook' | 'sms';
    config: Record<string, any>;
    enabled: boolean;
  }) {
    try {
      await this.alerting.configureNotificationChannel(channelData);
      return { message: 'Notification channel configured successfully' };
    } catch (error) {
      throw new HttpException(
        'Failed to configure notification channel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('notifications/test/:channelType')
  @ApiOperation({ summary: 'Test notification channel' })
  @ApiResponse({ status: 200, description: 'Notification channel tested successfully' })
  async testNotificationChannel(@Param('channelType') channelType: string) {
    try {
      const success = await this.alerting.testNotificationChannel(channelType);
      return { 
        success,
        message: success ? 'Notification channel test successful' : 'Notification channel test failed'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to test notification channel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

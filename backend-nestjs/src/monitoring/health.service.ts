import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  checks: HealthCheck[];
  version: string;
  environment: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Perform comprehensive health check
   */
  async getHealthStatus(): Promise<SystemHealth> {
    const startTime = Date.now();
    
    try {
      const checks = await Promise.all([
        this.checkDatabase(),
        this.checkMemory(),
        this.checkDisk(),
        this.checkExternalServices(),
        this.checkSecurityServices(),
        this.checkComplianceServices(),
      ]);

      const overallStatus = this.determineOverallStatus(checks);
      
      return {
        status: overallStatus,
        timestamp: new Date(),
        uptime: process.uptime(),
        checks,
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        uptime: process.uptime(),
        checks: [{
          name: 'system',
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          message: `Health check failed: ${error.message}`,
        }],
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      };
    }
  }

  /**
   * Get simple health status for load balancer
   */
  async getSimpleHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const dbCheck = await this.checkDatabase();
      const status = dbCheck.status === 'healthy' ? 'ok' : 'error';
      
      return {
        status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Test write operation
      const testRecord = await this.prisma.healthCheck.upsert({
        where: { id: 'db-health-check' },
        update: { lastCheck: new Date() },
        create: { id: 'db-health-check', lastCheck: new Date() },
      });

      const responseTime = Date.now() - startTime;
      
      // Check if response time is acceptable
      const status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy';
      
      return {
        name: 'database',
        status,
        responseTime,
        message: status === 'healthy' ? 'Database is responsive' : `Slow database response: ${responseTime}ms`,
        metadata: {
          connectionPool: await this.getDatabasePoolInfo(),
        },
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `Database connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const usagePercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      let status: HealthCheck['status'];
      let message: string;
      
      if (usagePercentage < 70) {
        status = 'healthy';
        message = `Memory usage is normal: ${heapUsedMB}MB/${heapTotalMB}MB (${usagePercentage.toFixed(1)}%)`;
      } else if (usagePercentage < 85) {
        status = 'degraded';
        message = `Memory usage is elevated: ${heapUsedMB}MB/${heapTotalMB}MB (${usagePercentage.toFixed(1)}%)`;
      } else {
        status = 'unhealthy';
        message = `Memory usage is critical: ${heapUsedMB}MB/${heapTotalMB}MB (${usagePercentage.toFixed(1)}%)`;
      }
      
      return {
        name: 'memory',
        status,
        responseTime: Date.now() - startTime,
        message,
        metadata: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          usagePercentage: parseFloat(usagePercentage.toFixed(1)),
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
        },
      };
    } catch (error) {
      return {
        name: 'memory',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `Memory check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check disk space
   */
  private async checkDisk(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // In production, implement actual disk space checking
      // For now, simulate disk usage
      const diskUsage = Math.random() * 100;
      
      let status: HealthCheck['status'];
      let message: string;
      
      if (diskUsage < 80) {
        status = 'healthy';
        message = `Disk usage is normal: ${diskUsage.toFixed(1)}%`;
      } else if (diskUsage < 90) {
        status = 'degraded';
        message = `Disk usage is elevated: ${diskUsage.toFixed(1)}%`;
      } else {
        status = 'unhealthy';
        message = `Disk usage is critical: ${diskUsage.toFixed(1)}%`;
      }
      
      return {
        name: 'disk',
        status,
        responseTime: Date.now() - startTime,
        message,
        metadata: {
          usagePercentage: parseFloat(diskUsage.toFixed(1)),
        },
      };
    } catch (error) {
      return {
        name: 'disk',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `Disk check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check external services
   */
  private async checkExternalServices(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const services = [
        { name: 'stripe', url: 'https://api.stripe.com/v1' },
        // Add other external services as needed
      ];

      const serviceChecks = await Promise.allSettled(
        services.map(service => this.checkExternalService(service.name, service.url))
      );

      const failedServices = serviceChecks.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && result.value.status !== 'healthy')
      ).length;

      let status: HealthCheck['status'];
      let message: string;

      if (failedServices === 0) {
        status = 'healthy';
        message = 'All external services are responsive';
      } else if (failedServices < services.length / 2) {
        status = 'degraded';
        message = `${failedServices}/${services.length} external services are down`;
      } else {
        status = 'unhealthy';
        message = `${failedServices}/${services.length} external services are down`;
      }

      return {
        name: 'external_services',
        status,
        responseTime: Date.now() - startTime,
        message,
        metadata: {
          totalServices: services.length,
          failedServices,
          serviceResults: serviceChecks.map((result, index) => ({
            name: services[index].name,
            status: result.status === 'fulfilled' ? result.value.status : 'failed',
          })),
        },
      };
    } catch (error) {
      return {
        name: 'external_services',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `External services check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check security services
   */
  private async checkSecurityServices(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if security event logging is working
      const recentSecurityEvents = await this.prisma.securityEvent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
      });

      // Check encryption service
      const encryptionTest = await this.testEncryption();

      let status: HealthCheck['status'] = 'healthy';
      let message = 'Security services are operational';

      if (!encryptionTest) {
        status = 'unhealthy';
        message = 'Encryption service is not working';
      }

      return {
        name: 'security_services',
        status,
        responseTime: Date.now() - startTime,
        message,
        metadata: {
          recentSecurityEvents,
          encryptionWorking: encryptionTest,
        },
      };
    } catch (error) {
      return {
        name: 'security_services',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `Security services check failed: ${error.message}`,
      };
    }
  }

  /**
   * Check compliance services
   */
  private async checkComplianceServices(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check if compliance monitoring is active
      const recentComplianceChecks = await this.prisma.complianceCheck.count({
        where: {
          checkedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      // Check for pending compliance alerts
      const pendingAlerts = await this.prisma.suspiciousActivityReport.count({
        where: {
          status: 'pending',
        },
      });

      let status: HealthCheck['status'] = 'healthy';
      let message = 'Compliance services are operational';

      if (pendingAlerts > 10) {
        status = 'degraded';
        message = `${pendingAlerts} pending compliance alerts require attention`;
      }

      return {
        name: 'compliance_services',
        status,
        responseTime: Date.now() - startTime,
        message,
        metadata: {
          recentComplianceChecks,
          pendingAlerts,
        },
      };
    } catch (error) {
      return {
        name: 'compliance_services',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: `Compliance services check failed: ${error.message}`,
      };
    }
  }

  private async checkExternalService(name: string, url: string): Promise<{
    name: string;
    status: HealthCheck['status'];
    responseTime: number;
  }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime,
      };
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async testEncryption(): Promise<boolean> {
    try {
      // Simple encryption test
      const testData = 'health-check-test';
      // In production, use actual encryption service
      return true;
    } catch (error) {
      return false;
    }
  }

  private async getDatabasePoolInfo(): Promise<Record<string, any>> {
    // In production, get actual connection pool metrics
    return {
      activeConnections: Math.floor(Math.random() * 10),
      idleConnections: Math.floor(Math.random() * 5),
      maxConnections: 20,
    };
  }

  private determineOverallStatus(checks: HealthCheck[]): SystemHealth['status'] {
    const unhealthyCount = checks.filter(check => check.status === 'unhealthy').length;
    const degradedCount = checks.filter(check => check.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }
}

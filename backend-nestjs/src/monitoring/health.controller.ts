import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get simple health status for load balancer' })
  @ApiResponse({ status: 200, description: 'Health status retrieved successfully' })
  async getSimpleHealth() {
    return await this.health.getSimpleHealth();
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Get detailed health status' })
  @ApiResponse({ status: 200, description: 'Detailed health status retrieved successfully' })
  async getDetailedHealth() {
    return await this.health.getHealthStatus();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async getReadiness() {
    const health = await this.health.getHealthStatus();
    
    if (health.status === 'unhealthy') {
      throw new Error('Service is not ready');
    }
    
    return { status: 'ready', timestamp: new Date().toISOString() };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async getLiveness() {
    return { 
      status: 'alive', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}

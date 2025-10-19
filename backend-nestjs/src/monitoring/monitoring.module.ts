import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { MonitoringService } from './monitoring.service';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';
import { AlertingService } from './alerting.service';
import { MonitoringController } from './monitoring.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SecurityModule,
  ],
  providers: [
    MonitoringService,
    HealthService,
    MetricsService,
    AlertingService,
  ],
  controllers: [
    MonitoringController,
    HealthController,
  ],
  exports: [
    MonitoringService,
    HealthService,
    MetricsService,
    AlertingService,
  ],
})
export class MonitoringModule {}

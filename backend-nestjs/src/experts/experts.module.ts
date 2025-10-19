import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ExpertsService } from './experts.service';
import { ExpertMatchingService } from './expert-matching.service';
import { ExpertSessionService } from './expert-session.service';
import { ExpertsController } from './experts.controller';
import { SecurityModule } from '../security/security.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
    MonitoringModule,
    NotificationsModule,
    PaymentsModule,
  ],
  providers: [
    ExpertsService,
    ExpertMatchingService,
    ExpertSessionService,
  ],
  controllers: [ExpertsController],
  exports: [
    ExpertsService,
    ExpertMatchingService,
    ExpertSessionService,
  ],
})
export class ExpertsModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiService } from './ai.service';
import { ModelService } from './model.service';
import { RagService } from './rag.service';
import { InsightsService } from './insights.service';
import { PredictionService } from './prediction.service';
import { AiController } from './ai.controller';
import { SecurityModule } from '../security/security.module';
import { MonitoringModule } from '../monitoring/monitoring.module';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
    MonitoringModule,
  ],
  providers: [
    AiService,
    ModelService,
    RagService,
    InsightsService,
    PredictionService,
  ],
  controllers: [AiController],
  exports: [
    AiService,
    ModelService,
    RagService,
    InsightsService,
    PredictionService,
  ],
})
export class AiModule {}

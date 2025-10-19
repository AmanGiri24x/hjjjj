import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FinnyService } from './finny.service';
import { GeminiService } from './gemini.service';
import { PersonalizationService } from './personalization.service';
import { RevolutionaryFeaturesService } from './revolutionary-features.service';
import { FinnyController } from './finny.controller';
import { EnhancedFinnyController } from './enhanced-finny.controller';
import { SecurityModule } from '../security/security.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { AiModule } from '../ai/ai.module';
import { SupabaseDirectService } from '../database/supabase-direct.service';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
    MonitoringModule,
    AiModule,
  ],
  providers: [
    FinnyService,
    GeminiService,
    PersonalizationService,
    RevolutionaryFeaturesService,
    SupabaseDirectService,
  ],
  controllers: [FinnyController, EnhancedFinnyController],
  exports: [
    FinnyService,
    GeminiService,
    PersonalizationService,
    RevolutionaryFeaturesService,
    SupabaseDirectService,
  ],
})
export class FinnyModule {}

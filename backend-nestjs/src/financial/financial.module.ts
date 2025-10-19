import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { FinnyModule } from '../finny/finny.module';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { RealFinancialController } from './real-financial.controller';
import { RealFinancialService } from './real-financial.service';
import { SupabaseFinancialController } from './supabase-financial.controller';
import { SupabaseDirectService } from '../database/supabase-direct.service';

@Module({
  imports: [ConfigModule, PrismaModule, FinnyModule],
  controllers: [
    FinancialController, 
    RealFinancialController, 
    SupabaseFinancialController
  ],
  providers: [
    FinancialService, 
    RealFinancialService, 
    SupabaseDirectService
  ],
  exports: [
    FinancialService, 
    RealFinancialService, 
    SupabaseDirectService
  ],
})
export class FinancialModule {}

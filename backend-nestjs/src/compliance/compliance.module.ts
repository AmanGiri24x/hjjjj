import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { ComplianceService } from './compliance.service';
import { GdprService } from './gdpr.service';
import { AmlService } from './aml.service';
import { PciDssService } from './pci-dss.service';
import { SoxService } from './sox.service';
import { ComplianceController } from './compliance.controller';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SecurityModule,
  ],
  providers: [
    ComplianceService,
    GdprService,
    AmlService,
    PciDssService,
    SoxService,
  ],
  controllers: [
    ComplianceController,
  ],
  exports: [
    ComplianceService,
    GdprService,
    AmlService,
    PciDssService,
    SoxService,
  ],
})
export class ComplianceModule {}

import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { AuditLogService } from './audit-log.service';
import { SessionService } from './session.service';
import { EncryptionService } from './encryption.service';

@Module({
  providers: [
    SecurityService,
    AuditLogService,
    SessionService,
    EncryptionService,
  ],
  controllers: [SecurityController],
  exports: [
    SecurityService,
    AuditLogService,
    SessionService,
    EncryptionService,
  ],
})
export class SecurityModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    SecurityModule,
  ],
  providers: [
    PaymentsService,
    StripeService,
    WebhookService,
  ],
  controllers: [
    PaymentsController,
  ],
  exports: [
    PaymentsService,
    StripeService,
  ],
})
export class PaymentsModule {}

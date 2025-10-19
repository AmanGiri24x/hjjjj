import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';
import { FinanceService } from './finance.service';
import { TransactionService } from './transaction.service';
import { BudgetService } from './budget.service';
import { GoalService } from './goal.service';
import { FinanceController } from './finance.controller';

@Module({
  imports: [
    PrismaModule,
    SecurityModule,
  ],
  providers: [
    FinanceService,
    TransactionService,
    BudgetService,
    GoalService,
  ],
  controllers: [
    FinanceController,
  ],
  exports: [
    FinanceService,
    TransactionService,
    BudgetService,
    GoalService,
  ],
})
export class FinanceModule {}

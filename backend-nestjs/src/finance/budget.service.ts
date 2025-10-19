import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';

export interface CreateBudgetDto {
  category: string;
  budgeted: number;
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  alertThreshold: number;
  description?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  period: string;
  alertThreshold: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
  ) {}

  async createBudget(userId: string, data: CreateBudgetDto, ipAddress: string): Promise<Budget> {
    try {
      this.validateBudgetData(data);

      const budget = await this.prisma.budget.create({
        data: {
          userId,
          category: data.category,
          budgeted: data.budgeted,
          spent: 0,
          remaining: data.budgeted,
          period: data.period,
          alertThreshold: data.alertThreshold,
          description: data.description,
          isActive: true,
        },
      });

      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_BUDGET',
        resource: 'budget',
        ipAddress,
        userAgent: '',
        metadata: { budgetId: budget.id, category: data.category, amount: data.budgeted },
        riskLevel: 'LOW',
      });

      return this.mapBudget(budget);
    } catch (error) {
      this.logger.error(`Failed to create budget: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserBudgets(userId: string): Promise<Budget[]> {
    try {
      const budgets = await this.prisma.budget.findMany({
        where: { userId, isActive: true },
        orderBy: { category: 'asc' },
      });

      return budgets.map(this.mapBudget);
    } catch (error) {
      this.logger.error(`Failed to get budgets: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validateBudgetData(data: CreateBudgetDto): void {
    if (!data.category || data.category.trim().length === 0) {
      throw new BadRequestException('Category is required');
    }
    if (data.budgeted <= 0) {
      throw new BadRequestException('Budget amount must be positive');
    }
    if (data.alertThreshold < 0 || data.alertThreshold > 100) {
      throw new BadRequestException('Alert threshold must be between 0 and 100');
    }
  }

  private mapBudget(dbBudget: any): Budget {
    return {
      id: dbBudget.id,
      userId: dbBudget.userId,
      category: dbBudget.category,
      budgeted: dbBudget.budgeted,
      spent: dbBudget.spent,
      remaining: dbBudget.remaining,
      period: dbBudget.period,
      alertThreshold: dbBudget.alertThreshold,
      description: dbBudget.description,
      isActive: dbBudget.isActive,
      createdAt: dbBudget.createdAt,
      updatedAt: dbBudget.updatedAt,
    };
  }
}

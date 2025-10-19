import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  targetDate: Date;
  category: 'SAVINGS' | 'DEBT' | 'INVESTMENT' | 'PURCHASE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description?: string;
  initialAmount?: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  priority: string;
  description?: string;
  isActive: boolean;
  progress: number;
  monthsRemaining: number;
  monthlyTarget: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GoalService {
  private readonly logger = new Logger(GoalService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
  ) {}

  async createGoal(userId: string, data: CreateGoalDto, ipAddress: string): Promise<Goal> {
    try {
      this.validateGoalData(data);

      const goal = await this.prisma.goal.create({
        data: {
          userId,
          name: data.name,
          targetAmount: data.targetAmount,
          currentAmount: data.initialAmount || 0,
          targetDate: data.targetDate,
          category: data.category,
          priority: data.priority,
          description: data.description,
          isActive: true,
        },
      });

      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_GOAL',
        resource: 'goal',
        ipAddress,
        userAgent: '',
        metadata: { 
          goalId: goal.id, 
          name: data.name, 
          targetAmount: data.targetAmount,
          category: data.category 
        },
        riskLevel: 'LOW',
      });

      return this.mapGoal(goal);
    } catch (error) {
      this.logger.error(`Failed to create goal: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserGoals(userId: string): Promise<Goal[]> {
    try {
      const goals = await this.prisma.goal.findMany({
        where: { userId, isActive: true },
        orderBy: { priority: 'desc' },
      });

      return goals.map(this.mapGoal);
    } catch (error) {
      this.logger.error(`Failed to get goals: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateGoalProgress(userId: string, goalId: string, amount: number, ipAddress: string): Promise<Goal> {
    try {
      const goal = await this.prisma.goal.findFirst({
        where: { id: goalId, userId },
      });

      if (!goal) {
        throw new BadRequestException('Goal not found');
      }

      const updatedGoal = await this.prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: goal.currentAmount + amount,
        },
      });

      await this.security.logSecurityEvent({
        userId,
        action: 'UPDATE_GOAL_PROGRESS',
        resource: 'goal',
        ipAddress,
        userAgent: '',
        metadata: { 
          goalId, 
          amount, 
          newTotal: updatedGoal.currentAmount 
        },
        riskLevel: 'LOW',
      });

      return this.mapGoal(updatedGoal);
    } catch (error) {
      this.logger.error(`Failed to update goal progress: ${error.message}`, error.stack);
      throw error;
    }
  }

  private validateGoalData(data: CreateGoalDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('Goal name is required');
    }
    if (data.targetAmount <= 0) {
      throw new BadRequestException('Target amount must be positive');
    }
    if (data.targetDate <= new Date()) {
      throw new BadRequestException('Target date must be in the future');
    }
    if (!['SAVINGS', 'DEBT', 'INVESTMENT', 'PURCHASE'].includes(data.category)) {
      throw new BadRequestException('Invalid goal category');
    }
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(data.priority)) {
      throw new BadRequestException('Invalid priority level');
    }
  }

  private mapGoal(dbGoal: any): Goal {
    const progress = dbGoal.targetAmount > 0 ? (dbGoal.currentAmount / dbGoal.targetAmount) * 100 : 0;
    const monthsRemaining = Math.max(0, Math.ceil((new Date(dbGoal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    const remaining = Math.max(0, dbGoal.targetAmount - dbGoal.currentAmount);
    const monthlyTarget = monthsRemaining > 0 ? remaining / monthsRemaining : 0;

    return {
      id: dbGoal.id,
      userId: dbGoal.userId,
      name: dbGoal.name,
      targetAmount: dbGoal.targetAmount,
      currentAmount: dbGoal.currentAmount,
      targetDate: dbGoal.targetDate,
      category: dbGoal.category,
      priority: dbGoal.priority,
      description: dbGoal.description,
      isActive: dbGoal.isActive,
      progress: Math.min(progress, 100),
      monthsRemaining,
      monthlyTarget,
      createdAt: dbGoal.createdAt,
      updatedAt: dbGoal.updatedAt,
    };
  }
}

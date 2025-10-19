import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialService } from './financial.service';
import { CreateTransactionDto, CreateFinancialDataDto, CreateGoalDto, CreateBudgetDto } from './dto';

@Controller('financial')
@UseGuards(JwtAuthGuard)
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // Financial Data Endpoints
  @Get('data')
  async getFinancialData(@Request() req) {
    return this.financialService.getFinancialData(req.user.id);
  }

  @Post('data')
  async createFinancialData(@Request() req, @Body() data: CreateFinancialDataDto) {
    return this.financialService.createFinancialData(req.user.id, data);
  }

  @Put('data')
  async updateFinancialData(@Request() req, @Body() data: Partial<CreateFinancialDataDto>) {
    return this.financialService.updateFinancialData(req.user.id, data);
  }

  // Transaction Endpoints
  @Get('transactions')
  async getTransactions(@Request() req) {
    return this.financialService.getTransactions(req.user.id);
  }

  @Post('transactions')
  async createTransaction(@Request() req, @Body() data: CreateTransactionDto) {
    return this.financialService.createTransaction(req.user.id, data);
  }

  // Goal Endpoints
  @Get('goals')
  async getGoals(@Request() req) {
    return this.financialService.getGoals(req.user.id);
  }

  @Post('goals')
  async createGoal(@Request() req, @Body() data: CreateGoalDto) {
    return this.financialService.createGoal(req.user.id, data);
  }

  @Put('goals/:id')
  async updateGoal(@Request() req, @Param('id') goalId: string, @Body() data: Partial<CreateGoalDto>) {
    return this.financialService.updateGoal(req.user.id, goalId, data);
  }

  @Delete('goals/:id')
  async deleteGoal(@Request() req, @Param('id') goalId: string) {
    return this.financialService.deleteGoal(req.user.id, goalId);
  }

  // Budget Endpoints
  @Get('budgets')
  async getBudgets(@Request() req) {
    return this.financialService.getBudgets(req.user.id);
  }

  @Post('budgets')
  async createBudget(@Request() req, @Body() data: CreateBudgetDto) {
    return this.financialService.createBudget(req.user.id, data);
  }

  @Put('budgets/:id')
  async updateBudget(@Request() req, @Param('id') budgetId: string, @Body() data: Partial<CreateBudgetDto>) {
    return this.financialService.updateBudget(req.user.id, budgetId, data);
  }

  @Delete('budgets/:id')
  async deleteBudget(@Request() req, @Param('id') budgetId: string) {
    return this.financialService.deleteBudget(req.user.id, budgetId);
  }

  // Analytics Endpoints
  @Get('analytics/expenses')
  async getExpenseAnalytics(@Request() req) {
    return this.financialService.getExpenseAnalytics(req.user.id);
  }

  @Get('insights')
  async getAIInsights(@Request() req) {
    return this.financialService.getAIInsights(req.user.id);
  }
}

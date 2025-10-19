import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RealFinancialService, TransactionInput } from './real-financial.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/financial')
@UseGuards(JwtAuthGuard)
export class RealFinancialController {
  constructor(private readonly financialService: RealFinancialService) {}

  @Post('transactions')
  async addTransaction(@Request() req, @Body() transaction: TransactionInput) {
    const userId = req.user.id;
    return this.financialService.addTransaction(userId, transaction);
  }

  @Get('summary')
  async getFinancialSummary(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getFinancialSummary(userId);
  }

  @Get('ai-analysis')
  async getAIAnalysis(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getAIAnalysis(userId);
  }

  @Get('transactions/category/:category')
  async getTransactionsByCategory(@Request() req, @Param('category') category: string) {
    const userId = req.user.id;
    return this.financialService.getTransactionsByCategory(userId, category);
  }

  @Get('transactions/range')
  async getTransactionsByDateRange(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const userId = req.user.id;
    return this.financialService.getTransactionsByDateRange(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  // Quick add common expenses
  @Post('quick-expense')
  async addQuickExpense(@Request() req, @Body() data: { type: string; amount: number }) {
    const userId = req.user.id;
    
    const expenseTemplates = {
      rent: { category: 'Housing', description: 'Monthly Rent' },
      groceries: { category: 'Food', description: 'Grocery Shopping' },
      fuel: { category: 'Transportation', description: 'Fuel/Petrol' },
      electricity: { category: 'Utilities', description: 'Electricity Bill' },
      internet: { category: 'Utilities', description: 'Internet Bill' },
      dining: { category: 'Food', description: 'Dining Out' },
      shopping: { category: 'Shopping', description: 'General Shopping' },
      medical: { category: 'Healthcare', description: 'Medical Expense' },
    };

    const template = expenseTemplates[data.type] || { 
      category: 'Other', 
      description: 'General Expense' 
    };

    const transaction: TransactionInput = {
      amount: data.amount,
      description: template.description,
      category: template.category,
      type: 'expense',
      date: new Date(),
    };

    return this.financialService.addTransaction(userId, transaction);
  }

  // Add income
  @Post('income')
  async addIncome(@Request() req, @Body() data: { amount: number; source: string; description?: string }) {
    const userId = req.user.id;
    
    const transaction: TransactionInput = {
      amount: data.amount,
      description: data.description || `Income from ${data.source}`,
      category: 'Salary',
      type: 'income',
      date: new Date(),
    };

    return this.financialService.addTransaction(userId, transaction);
  }

  // Get all transactions with pagination
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('category') category?: string,
    @Query('type') type?: 'income' | 'expense'
  ) {
    const userId = req.user.id;
    return this.financialService.getTransactions(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      type
    });
  }

  // Update transaction
  @Post('transactions/:id/update')
  async updateTransaction(
    @Request() req,
    @Param('id') transactionId: string,
    @Body() updates: Partial<TransactionInput>
  ) {
    const userId = req.user.id;
    return this.financialService.updateTransaction(userId, transactionId, updates);
  }

  // Delete transaction
  @Post('transactions/:id/delete')
  async deleteTransaction(@Request() req, @Param('id') transactionId: string) {
    const userId = req.user.id;
    return this.financialService.deleteTransaction(userId, transactionId);
  }

  // Get spending analytics
  @Get('analytics/spending')
  async getSpendingAnalytics(
    @Request() req,
    @Query('period') period: string = '30d'
  ) {
    const userId = req.user.id;
    return this.financialService.getSpendingAnalytics(userId, period);
  }

  // Get income analytics
  @Get('analytics/income')
  async getIncomeAnalytics(
    @Request() req,
    @Query('period') period: string = '30d'
  ) {
    const userId = req.user.id;
    return this.financialService.getIncomeAnalytics(userId, period);
  }

  // Get category breakdown
  @Get('analytics/categories')
  async getCategoryBreakdown(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getCategoryBreakdown(userId);
  }

  // Get monthly comparison
  @Get('analytics/monthly-comparison')
  async getMonthlyComparison(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getMonthlyComparison(userId);
  }

  // Set financial goals
  @Post('goals')
  async setFinancialGoal(
    @Request() req,
    @Body() goal: {
      name: string;
      targetAmount: number;
      targetDate: string;
      category: string;
      priority: 'low' | 'medium' | 'high';
    }
  ) {
    const userId = req.user.id;
    return this.financialService.setFinancialGoal(userId, goal);
  }

  // Get financial goals
  @Get('goals')
  async getFinancialGoals(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getFinancialGoals(userId);
  }

  // Update goal progress
  @Post('goals/:id/progress')
  async updateGoalProgress(
    @Request() req,
    @Param('id') goalId: string,
    @Body() data: { amount: number }
  ) {
    const userId = req.user.id;
    return this.financialService.updateGoalProgress(userId, goalId, data.amount);
  }

  // Get AI recommendations
  @Get('ai-recommendations')
  async getAIRecommendations(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getAIRecommendations(userId);
  }

  // Get expense predictions
  @Get('predictions/expenses')
  async getExpensePredictions(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getExpensePredictions(userId);
  }

  // Get savings forecast
  @Get('predictions/savings')
  async getSavingsForecast(@Request() req) {
    const userId = req.user.id;
    return this.financialService.getSavingsForecast(userId);
  }

  // Export financial data
  @Get('export')
  async exportFinancialData(
    @Request() req,
    @Query('format') format: string = 'json',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = req.user.id;
    return this.financialService.exportFinancialData(userId, {
      format,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });
  }
}

import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SupabaseDirectService } from '../database/supabase-direct.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface TransactionInput {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense' | 'transfer';
  date?: Date;
  tags?: string[];
  merchantName?: string;
}

@Controller('api/financial')
@UseGuards(JwtAuthGuard)
export class SupabaseFinancialController {
  constructor(private readonly supabaseService: SupabaseDirectService) {}

  @Post('transactions')
  async addTransaction(@Request() req, @Body() transaction: TransactionInput) {
    const userId = req.user.id;
    return this.supabaseService.addTransaction(userId, transaction);
  }

  @Get('summary')
  async getFinancialSummary(@Request() req) {
    const userId = req.user.id;
    return this.supabaseService.getFinancialSummary(userId);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('category') category?: string,
    @Query('type') type?: 'income' | 'expense'
  ) {
    const userId = req.user.id;
    return this.supabaseService.getTransactions(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      type
    });
  }

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

    return this.supabaseService.addTransaction(userId, transaction);
  }

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

    return this.supabaseService.addTransaction(userId, transaction);
  }

  @Get('ai-analysis')
  async getAIAnalysis(@Request() req) {
    const userId = req.user.id;
    const summary = await this.supabaseService.getFinancialSummary(userId);
    
    // Simple AI analysis based on financial data
    const analysis = {
      spendingInsights: [
        `Your monthly expenses are ₹${summary.monthlyExpenses.toFixed(2)}`,
        `Top spending category: ${summary.topCategories[0]?.category || 'Unknown'}`,
        `Savings rate: ${((summary.netSavings / summary.totalIncome) * 100).toFixed(1)}%`
      ],
      recommendations: [
        'Track daily expenses to identify spending patterns',
        'Set up automatic savings transfers',
        'Review and optimize recurring expenses'
      ],
      riskAssessment: summary.netSavings < 0 ? 'High - Expenses exceed income' : 'Medium - Monitor spending closely',
      budgetSuggestions: summary.topCategories.slice(0, 3).map(cat => ({
        category: cat.category,
        suggestedAmount: Math.round(cat.amount * 0.9),
        reason: `Reduce ${cat.category} spending by 10% to improve savings`
      })),
      investmentAdvice: [
        'Start with emergency fund (3-6 months expenses)',
        'Consider SIP in diversified mutual funds',
        'Explore tax-saving investments under 80C'
      ],
      savingsGoalProgress: {
        currentSavings: summary.netSavings,
        monthlyTarget: Math.max(summary.monthlyIncome * 0.2, 5000),
        projectedGoalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };

    return analysis;
  }

  @Get('test-connection')
  async testConnection() {
    const isConnected = await this.supabaseService.testConnection();
    return {
      connected: isConnected,
      message: isConnected ? 'Database connection successful' : 'Database connection failed',
      timestamp: new Date().toISOString()
    };
  }

  @Post('initialize-db')
  async initializeDatabase() {
    const success = await this.supabaseService.createTables();
    return {
      success,
      message: success ? 'Database initialized successfully' : 'Database initialization failed',
      timestamp: new Date().toISOString()
    };
  }
}

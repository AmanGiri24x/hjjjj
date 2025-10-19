import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiService } from '../finny/gemini.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface TransactionInput {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense' | 'transfer';
  date?: Date;
  tags?: string[];
  merchantName?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: any[];
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
}

export interface AIAnalysis {
  spendingInsights: string[];
  recommendations: string[];
  riskAssessment: string;
  budgetSuggestions: Array<{
    category: string;
    suggestedAmount: number;
    reason: string;
  }>;
  investmentAdvice: string[];
  savingsGoalProgress: {
    currentSavings: number;
    monthlyTarget: number;
    projectedGoalDate: string;
  };
}

@Injectable()
export class RealFinancialService {
  private readonly logger = new Logger(RealFinancialService.name);

  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  // Add a real transaction
  async addTransaction(userId: string, transaction: TransactionInput) {
    try {
      // Create the transaction
      const newTransaction = await this.prisma.transaction.create({
        data: {
          userId,
          amount: new Decimal(transaction.amount),
          description: transaction.description,
          category: transaction.category,
          type: transaction.type,
          date: transaction.date || new Date(),
          tags: transaction.tags || [],
          merchantName: transaction.merchantName,
        },
      });

      // Update user's financial summary
      await this.updateFinancialSummary(userId);

      this.logger.log(`Transaction added for user ${userId}: ${transaction.type} of ${transaction.amount}`);
      
      return newTransaction;
    } catch (error) {
      this.logger.error(`Failed to add transaction for user ${userId}:`, error);
      throw error;
    }
  }

  // Get real financial summary
  async getFinancialSummary(userId: string): Promise<FinancialSummary> {
    try {
      // Get all transactions for the user
      const transactions = await this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      });

      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const netSavings = totalIncome - totalExpenses;

      // Calculate monthly averages (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const recentTransactions = transactions.filter(t => t.date >= twelveMonthsAgo);
      const monthlyIncome = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0) / 12;

      const monthlyExpenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0) / 12;

      // Calculate top spending categories
      const categoryTotals = new Map<string, number>();
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const current = categoryTotals.get(t.category) || 0;
          categoryTotals.set(t.category, current + Number(t.amount));
        });

      const topCategories = Array.from(categoryTotals.entries())
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: (amount / totalExpenses) * 100,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Calculate monthly trend (last 6 months)
      const monthlyTrend = this.calculateMonthlyTrend(transactions, 6);

      return {
        totalIncome,
        totalExpenses,
        netSavings,
        monthlyIncome,
        monthlyExpenses,
        topCategories,
        recentTransactions: transactions.slice(0, 10),
        monthlyTrend,
      };
    } catch (error) {
      this.logger.error(`Failed to get financial summary for user ${userId}:`, error);
      throw error;
    }
  }

  // Get AI analysis of user's finances
  async getAIAnalysis(userId: string): Promise<AIAnalysis> {
    try {
      const summary = await this.getFinancialSummary(userId);
      
      // Prepare data for AI analysis
      const analysisPrompt = `
        Analyze this user's financial data and provide insights:
        
        Total Income: ₹${summary.totalIncome}
        Total Expenses: ₹${summary.totalExpenses}
        Net Savings: ₹${summary.netSavings}
        Monthly Income: ₹${summary.monthlyIncome.toFixed(2)}
        Monthly Expenses: ₹${summary.monthlyExpenses.toFixed(2)}
        
        Top Spending Categories:
        ${summary.topCategories.map(cat => `- ${cat.category}: ₹${cat.amount} (${cat.percentage.toFixed(1)}%)`).join('\n')}
        
        Monthly Trend (last 6 months):
        ${summary.monthlyTrend.map(month => `${month.month}: Income ₹${month.income}, Expenses ₹${month.expenses}, Savings ₹${month.savings}`).join('\n')}
        
        Please provide:
        1. 3-5 key spending insights
        2. 3-5 actionable recommendations
        3. Risk assessment (low/medium/high)
        4. Budget suggestions for top categories
        5. Investment advice based on savings capacity
        6. Savings goal progress analysis
        
        Format as JSON with the structure: {
          "spendingInsights": ["insight1", "insight2", ...],
          "recommendations": ["rec1", "rec2", ...],
          "riskAssessment": "low/medium/high with explanation",
          "budgetSuggestions": [{"category": "rent", "suggestedAmount": 25000, "reason": "explanation"}, ...],
          "investmentAdvice": ["advice1", "advice2", ...],
          "savingsGoalProgress": {"currentSavings": 50000, "monthlyTarget": 10000, "projectedGoalDate": "2024-12-31"}
        }
      `;

      const aiResponse = await this.geminiService.generateResponse(analysisPrompt);
      
      try {
        // Try to parse JSON response
        const analysis = JSON.parse(aiResponse);
        return analysis;
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        return {
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
      }
    } catch (error) {
      this.logger.error(`Failed to get AI analysis for user ${userId}:`, error);
      throw error;
    }
  }

  // Update financial summary in database
  private async updateFinancialSummary(userId: string) {
    try {
      const summary = await this.getFinancialSummary(userId);
      
      await this.prisma.financialData.upsert({
        where: { userId },
        update: {
          totalBalance: new Decimal(summary.netSavings),
          monthlyIncome: new Decimal(summary.monthlyIncome),
          monthlyExpenses: new Decimal(summary.monthlyExpenses),
          savings: new Decimal(Math.max(summary.netSavings, 0)),
          debt: new Decimal(Math.max(-summary.netSavings, 0)),
        },
        create: {
          userId,
          totalBalance: new Decimal(summary.netSavings),
          monthlyIncome: new Decimal(summary.monthlyIncome),
          monthlyExpenses: new Decimal(summary.monthlyExpenses),
          savings: new Decimal(Math.max(summary.netSavings, 0)),
          debt: new Decimal(Math.max(-summary.netSavings, 0)),
          investments: new Decimal(0),
          creditScore: 0,
          portfolioValue: new Decimal(0),
          monthlyGrowth: new Decimal(0),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update financial summary for user ${userId}:`, error);
    }
  }

  // Calculate monthly trend
  private calculateMonthlyTrend(transactions: any[], months: number) {
    const trend = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      trend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        savings: income - expenses,
      });
    }
    
    return trend;
  }

  // Get transactions by category
  async getTransactionsByCategory(userId: string, category: string) {
    return this.prisma.transaction.findMany({
      where: { 
        userId,
        category: {
          contains: category,
          mode: 'insensitive'
        }
      },
      orderBy: { date: 'desc' },
    });
  }

  // Get transactions by date range
  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Get transactions with pagination and filters
  async getTransactions(userId: string, options: {
    page: number;
    limit: number;
    category?: string;
    type?: 'income' | 'expense';
  }) {
    const skip = (options.page - 1) * options.limit;
    
    const where: any = { userId };
    if (options.category) {
      where.category = { contains: options.category, mode: 'insensitive' };
    }
    if (options.type) {
      where.type = options.type;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: options.limit,
      }),
      this.prisma.transaction.count({ where })
    ]);

    return {
      transactions,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit)
      }
    };
  }

  // Update transaction
  async updateTransaction(userId: string, transactionId: string, updates: Partial<TransactionInput>) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...updates,
        amount: updates.amount ? new Decimal(updates.amount) : undefined
      }
    });

    await this.updateFinancialSummary(userId);
    return updatedTransaction;
  }

  // Delete transaction
  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    await this.prisma.transaction.delete({
      where: { id: transactionId }
    });

    await this.updateFinancialSummary(userId);
    return { success: true };
  }

  // Get spending analytics
  async getSpendingAnalytics(userId: string, period: string) {
    const days = this.parsePeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' }
    });

    const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgDaily = totalSpent / days;
    
    // Category breakdown
    const categoryTotals = new Map<string, number>();
    transactions.forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + Number(t.amount));
    });

    const categories = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpent) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    // Daily spending trend
    const dailySpending = this.calculateDailyTrend(transactions, days);

    return {
      totalSpent,
      avgDaily,
      categories,
      dailySpending,
      transactionCount: transactions.length
    };
  }

  // Get income analytics
  async getIncomeAnalytics(userId: string, period: string) {
    const days = this.parsePeriod(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        type: 'income',
        date: { gte: startDate }
      },
      orderBy: { date: 'desc' }
    });

    const totalIncome = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const avgDaily = totalIncome / days;
    
    // Source breakdown
    const sourceTotals = new Map<string, number>();
    transactions.forEach(t => {
      const current = sourceTotals.get(t.category) || 0;
      sourceTotals.set(t.category, current + Number(t.amount));
    });

    const sources = Array.from(sourceTotals.entries())
      .map(([source, amount]) => ({
        source,
        amount,
        percentage: (amount / totalIncome) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      avgDaily,
      sources,
      transactionCount: transactions.length
    };
  }

  // Get category breakdown
  async getCategoryBreakdown(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    const expenseCategories = new Map<string, number>();
    const incomeCategories = new Map<string, number>();

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'expense') {
        const current = expenseCategories.get(t.category) || 0;
        expenseCategories.set(t.category, current + amount);
      } else if (t.type === 'income') {
        const current = incomeCategories.get(t.category) || 0;
        incomeCategories.set(t.category, current + amount);
      }
    });

    const totalExpenses = Array.from(expenseCategories.values()).reduce((sum, amount) => sum + amount, 0);
    const totalIncome = Array.from(incomeCategories.values()).reduce((sum, amount) => sum + amount, 0);

    return {
      expenses: Array.from(expenseCategories.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      })).sort((a, b) => b.amount - a.amount),
      income: Array.from(incomeCategories.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalIncome) * 100
      })).sort((a, b) => b.amount - a.amount)
    };
  }

  // Get monthly comparison
  async getMonthlyComparison(userId: string) {
    const currentMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [currentMonthData, lastMonthData] = await Promise.all([
      this.getMonthData(userId, currentMonth),
      this.getMonthData(userId, lastMonth)
    ]);

    return {
      current: currentMonthData,
      previous: lastMonthData,
      comparison: {
        incomeChange: this.calculatePercentageChange(lastMonthData.income, currentMonthData.income),
        expenseChange: this.calculatePercentageChange(lastMonthData.expenses, currentMonthData.expenses),
        savingsChange: this.calculatePercentageChange(lastMonthData.savings, currentMonthData.savings)
      }
    };
  }

  // Set financial goal
  async setFinancialGoal(userId: string, goal: {
    name: string;
    targetAmount: number;
    targetDate: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
  }) {
    return this.prisma.goal.create({
      data: {
        userId,
        name: goal.name,
        targetAmount: new Decimal(goal.targetAmount),
        currentAmount: new Decimal(0),
        targetDate: new Date(goal.targetDate),
        category: goal.category,
        priority: goal.priority,
        status: 'active'
      }
    });
  }

  // Get financial goals
  async getFinancialGoals(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Update goal progress
  async updateGoalProgress(userId: string, goalId: string, amount: number) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    const newAmount = Number(goal.currentAmount) + amount;
    const updatedGoal = await this.prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: new Decimal(newAmount),
        status: newAmount >= Number(goal.targetAmount) ? 'completed' : 'active'
      }
    });

    return updatedGoal;
  }

  // Get AI recommendations
  async getAIRecommendations(userId: string) {
    const summary = await this.getFinancialSummary(userId);
    const analysis = await this.getAIAnalysis(userId);

    return {
      personalizedTips: analysis.recommendations,
      budgetOptimization: analysis.budgetSuggestions,
      investmentAdvice: analysis.investmentAdvice,
      riskAssessment: analysis.riskAssessment,
      savingsGoal: analysis.savingsGoalProgress
    };
  }

  // Get expense predictions
  async getExpensePredictions(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, type: 'expense' },
      orderBy: { date: 'desc' },
      take: 90 // Last 3 months
    });

    if (transactions.length < 10) {
      return {
        nextMonth: 0,
        nextQuarter: 0,
        confidence: 'low',
        message: 'Need more transaction data for accurate predictions'
      };
    }

    const monthlyAvg = transactions.reduce((sum, t) => sum + Number(t.amount), 0) / 3;
    const nextMonth = monthlyAvg * 1.05; // 5% buffer
    const nextQuarter = monthlyAvg * 3 * 1.1; // 10% buffer for quarter

    return {
      nextMonth,
      nextQuarter,
      confidence: 'medium',
      breakdown: this.predictCategorySpending(transactions)
    };
  }

  // Get savings forecast
  async getSavingsForecast(userId: string) {
    const summary = await this.getFinancialSummary(userId);
    const monthlySavings = summary.monthlyIncome - summary.monthlyExpenses;

    const forecasts = {
      '6months': monthlySavings * 6,
      '1year': monthlySavings * 12,
      '2years': monthlySavings * 24,
      '5years': monthlySavings * 60
    };

    return {
      currentSavingsRate: (monthlySavings / summary.monthlyIncome) * 100,
      monthlySavings,
      forecasts,
      recommendations: this.generateSavingsRecommendations(monthlySavings, summary.monthlyIncome)
    };
  }

  // Export financial data
  async exportFinancialData(userId: string, options: {
    format: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = { userId };
    if (options.startDate) where.date = { gte: options.startDate };
    if (options.endDate) where.date = { ...where.date, lte: options.endDate };

    const [transactions, summary, goals] = await Promise.all([
      this.prisma.transaction.findMany({ where, orderBy: { date: 'desc' } }),
      this.getFinancialSummary(userId),
      this.getFinancialGoals(userId)
    ]);

    const exportData = {
      summary,
      transactions,
      goals,
      exportDate: new Date().toISOString(),
      period: {
        start: options.startDate?.toISOString(),
        end: options.endDate?.toISOString()
      }
    };

    return exportData;
  }

  // Helper methods
  private parsePeriod(period: string): number {
    const match = period.match(/(\d+)([dwmy])/);
    if (!match) return 30; // default 30 days

    const [, num, unit] = match;
    const value = parseInt(num);
    
    switch (unit) {
      case 'd': return value;
      case 'w': return value * 7;
      case 'm': return value * 30;
      case 'y': return value * 365;
      default: return 30;
    }
  }

  private calculateDailyTrend(transactions: any[], days: number) {
    const dailyTotals = new Map<string, number>();
    
    transactions.forEach(t => {
      const date = new Date(t.date).toISOString().split('T')[0];
      const current = dailyTotals.get(date) || 0;
      dailyTotals.set(date, current + Number(t.amount));
    });

    return Array.from(dailyTotals.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getMonthData(userId: string, month: Date) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      month: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      income,
      expenses,
      savings: income - expenses,
      transactionCount: transactions.length
    };
  }

  private calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  private predictCategorySpending(transactions: any[]) {
    const categoryTotals = new Map<string, number>();
    transactions.forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + Number(t.amount));
    });

    return Array.from(categoryTotals.entries())
      .map(([category, total]) => ({
        category,
        predicted: (total / 3) * 1.05, // Monthly average with 5% buffer
        confidence: 'medium'
      }))
      .sort((a, b) => b.predicted - a.predicted);
  }

  private generateSavingsRecommendations(monthlySavings: number, monthlyIncome: number) {
    const savingsRate = (monthlySavings / monthlyIncome) * 100;
    const recommendations = [];

    if (savingsRate < 10) {
      recommendations.push('Aim to save at least 10% of your income');
      recommendations.push('Review and reduce unnecessary expenses');
    } else if (savingsRate < 20) {
      recommendations.push('Great start! Try to increase savings to 20%');
      recommendations.push('Consider automating your savings');
    } else {
      recommendations.push('Excellent savings rate!');
      recommendations.push('Consider investing your surplus savings');
    }

    return recommendations;
  }
}

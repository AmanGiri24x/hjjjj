import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, CreateFinancialDataDto, CreateGoalDto, CreateBudgetDto } from './dto';
import { GeminiService } from '../finny/gemini.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  // Financial Data Operations
  async getFinancialData(userId: string) {
    const data = await this.prisma.financialData.findUnique({
      where: { userId },
    });

    if (!data) {
      // Create initial financial data for new user
      return this.createFinancialData(userId, {
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savings: 0,
        debt: 0,
        investments: 0,
        creditScore: 0,
        portfolioValue: 0,
        monthlyGrowth: 0,
      });
    }

    return data;
  }

  async createFinancialData(userId: string, data: CreateFinancialDataDto) {
    return this.prisma.financialData.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  async updateFinancialData(userId: string, data: Partial<CreateFinancialDataDto>) {
    return this.prisma.financialData.update({
      where: { userId },
      data,
    });
  }

  // Transaction Operations
  async getTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTransaction(userId: string, data: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        ...data,
      },
    });

    // Update financial data based on transaction
    await this.updateFinancialDataFromTransaction(userId, data);

    return transaction;
  }

  private async updateFinancialDataFromTransaction(userId: string, transaction: CreateTransactionDto) {
    const financialData = await this.getFinancialData(userId);
    
    const updates: Partial<CreateFinancialDataDto> = {};

    if (transaction.type === 'income') {
      updates.totalBalance = financialData.totalBalance + transaction.amount;
      updates.monthlyIncome = financialData.monthlyIncome + transaction.amount;
    } else if (transaction.type === 'expense') {
      updates.totalBalance = financialData.totalBalance - transaction.amount;
      updates.monthlyExpenses = financialData.monthlyExpenses + transaction.amount;
    }

    updates.savings = updates.totalBalance - financialData.debt;

    await this.updateFinancialData(userId, updates);
  }

  // Goal Operations
  async getGoals(userId: string) {
    return this.prisma.financialGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createGoal(userId: string, data: CreateGoalDto) {
    return this.prisma.financialGoal.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  async updateGoal(userId: string, goalId: string, data: Partial<CreateGoalDto>) {
    return this.prisma.financialGoal.update({
      where: { id: goalId, userId },
      data,
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    return this.prisma.financialGoal.delete({
      where: { id: goalId, userId },
    });
  }

  // Budget Operations
  async getBudgets(userId: string) {
    return this.prisma.budgetCategory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createBudget(userId: string, data: CreateBudgetDto) {
    return this.prisma.budgetCategory.create({
      data: {
        userId,
        ...data,
        spent: 0,
      },
    });
  }

  async updateBudget(userId: string, budgetId: string, data: Partial<CreateBudgetDto>) {
    return this.prisma.budgetCategory.update({
      where: { id: budgetId, userId },
      data,
    });
  }

  async deleteBudget(userId: string, budgetId: string) {
    return this.prisma.budgetCategory.delete({
      where: { id: budgetId, userId },
    });
  }

  // Analytics Operations
  async getExpenseAnalytics(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { 
        userId,
        type: 'expense',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by category
    const categoryExpenses = transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Group by month
    const monthlyExpenses = transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.createdAt).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      categoryExpenses,
      monthlyExpenses,
      totalTransactions: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    };
  }

  // AI Insights
  async getAIInsights(userId: string) {
    const [financialData, transactions, budgets] = await Promise.all([
      this.getFinancialData(userId),
      this.getTransactions(userId),
      this.getBudgets(userId),
    ]);

    const insights = [];

    // Spending analysis
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    if (expenseTransactions.length > 0) {
      const categorySpending = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      const topCategory = Object.entries(categorySpending)
        .sort(([,a], [,b]) => b - a)[0];

      if (topCategory) {
        const percentage = ((topCategory[1] / financialData.monthlyExpenses) * 100).toFixed(1);
        insights.push({
          type: 'warning',
          title: 'Highest Spending Category',
          message: `${topCategory[0]} accounts for ${percentage}% of your expenses (₹${topCategory[1].toLocaleString()})`,
        });
      }
    }

    // Budget analysis
    for (const budget of budgets) {
      const spentPercentage = (budget.spent / budget.limit) * 100;
      if (spentPercentage > 90) {
        insights.push({
          type: 'alert',
          title: 'Budget Alert',
          message: `You've spent ${spentPercentage.toFixed(0)}% of your ${budget.name} budget`,
        });
      } else if (spentPercentage < 50) {
        insights.push({
          type: 'success',
          title: 'Budget on Track',
          message: `Great job! You're only at ${spentPercentage.toFixed(0)}% of your ${budget.name} budget`,
        });
      }
    }

    // Savings rate analysis
    const savingsRate = ((financialData.monthlyIncome - financialData.monthlyExpenses) / financialData.monthlyIncome) * 100;
    if (savingsRate < 10) {
      insights.push({
        type: 'alert',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reducing expenses or increasing income.`,
      });
    } else if (savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Excellent Savings Rate',
        message: `Great job! You're saving ${savingsRate.toFixed(1)}% of your income.`,
      });
    }

    return insights;
  }
}

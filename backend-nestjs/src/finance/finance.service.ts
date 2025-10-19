import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { EncryptionService } from '../security/encryption.service';
import { TransactionService } from './transaction.service';
import { BudgetService } from './budget.service';
import { GoalService } from './goal.service';

export interface FinancialOverview {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  monthlyTrend: number;
  expensesByCategory: Record<string, number>;
  budgetUtilization: number;
  goalProgress: number;
}

export interface FinancialInsight {
  type: 'warning' | 'tip' | 'achievement' | 'alert';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
    private encryption: EncryptionService,
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private goalService: GoalService,
  ) {}

  /**
   * Get comprehensive financial overview for user
   */
  async getFinancialOverview(userId: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<FinancialOverview> {
    try {
      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'VIEW_FINANCIAL_OVERVIEW',
        resource: 'financial_data',
        ipAddress: '',
        userAgent: '',
        riskLevel: 'LOW',
      });

      const [transactions, budgets, goals] = await Promise.all([
        this.transactionService.getUserTransactions(userId, period),
        this.budgetService.getUserBudgets(userId),
        this.goalService.getUserGoals(userId),
      ]);

      // Calculate income and expenses
      const income = transactions
        .filter(t => t.type === 'INCOME' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'EXPENSE' && t.status === 'COMPLETED')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const netIncome = income - expenses;
      const savingsRate = income > 0 ? (netIncome / income) * 100 : 0;

      // Calculate expenses by category
      const expensesByCategory = transactions
        .filter(t => t.type === 'EXPENSE' && t.status === 'COMPLETED')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
          return acc;
        }, {} as Record<string, number>);

      // Calculate budget utilization
      const budgetUtilization = budgets.length > 0 
        ? budgets.reduce((sum, b) => sum + (b.spent / b.budgeted), 0) / budgets.length * 100
        : 0;

      // Calculate goal progress
      const goalProgress = goals.length > 0
        ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / goals.length * 100
        : 0;

      // Calculate monthly trend (simplified)
      const monthlyTrend = this.calculateTrend(transactions);

      return {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome,
        savingsRate,
        monthlyTrend,
        expensesByCategory,
        budgetUtilization,
        goalProgress,
      };
    } catch (error) {
      this.logger.error(`Failed to get financial overview: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate AI-powered financial insights
   */
  async generateFinancialInsights(userId: string): Promise<FinancialInsight[]> {
    try {
      const overview = await this.getFinancialOverview(userId);
      const insights: FinancialInsight[] = [];

      // Savings rate insights
      if (overview.savingsRate < 10) {
        insights.push({
          type: 'warning',
          title: 'Low Savings Rate',
          description: `Your savings rate is ${overview.savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
          actionable: true,
          priority: 'high',
          category: 'savings',
        });
      } else if (overview.savingsRate >= 20) {
        insights.push({
          type: 'achievement',
          title: 'Excellent Savings Rate',
          description: `Great job! Your ${overview.savingsRate.toFixed(1)}% savings rate exceeds the recommended 20%.`,
          actionable: false,
          priority: 'low',
          category: 'savings',
        });
      }

      // Budget utilization insights
      if (overview.budgetUtilization > 90) {
        insights.push({
          type: 'alert',
          title: 'Budget Overutilization',
          description: 'You\'re using over 90% of your budgets. Consider reviewing your spending or adjusting budget limits.',
          actionable: true,
          priority: 'high',
          category: 'budgeting',
        });
      }

      // Expense category insights
      const topExpenseCategory = Object.entries(overview.expensesByCategory)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topExpenseCategory && topExpenseCategory[1] > overview.totalExpenses * 0.4) {
        insights.push({
          type: 'tip',
          title: 'High Category Spending',
          description: `${topExpenseCategory[0]} accounts for ${((topExpenseCategory[1] / overview.totalExpenses) * 100).toFixed(1)}% of your expenses. Consider ways to optimize this category.`,
          actionable: true,
          priority: 'medium',
          category: 'spending',
        });
      }

      // Goal progress insights
      if (overview.goalProgress < 50) {
        insights.push({
          type: 'tip',
          title: 'Goal Progress',
          description: 'Your financial goals are progressing slowly. Consider increasing contributions or adjusting timelines.',
          actionable: true,
          priority: 'medium',
          category: 'goals',
        });
      }

      // Monthly trend insights
      if (overview.monthlyTrend < -10) {
        insights.push({
          type: 'warning',
          title: 'Declining Financial Health',
          description: 'Your financial metrics show a declining trend. Review your recent spending patterns.',
          actionable: true,
          priority: 'high',
          category: 'trends',
        });
      } else if (overview.monthlyTrend > 10) {
        insights.push({
          type: 'achievement',
          title: 'Improving Financial Health',
          description: 'Your financial metrics are trending positively. Keep up the good work!',
          actionable: false,
          priority: 'low',
          category: 'trends',
        });
      }

      return insights;
    } catch (error) {
      this.logger.error(`Failed to generate insights: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get financial health score
   */
  async getFinancialHealthScore(userId: string): Promise<{
    score: number;
    grade: string;
    factors: Array<{ name: string; score: number; weight: number; description: string }>;
  }> {
    try {
      const overview = await this.getFinancialOverview(userId);
      
      const factors = [
        {
          name: 'Savings Rate',
          score: Math.min(overview.savingsRate * 5, 100), // 20% savings = 100 points
          weight: 0.3,
          description: 'Percentage of income saved',
        },
        {
          name: 'Budget Adherence',
          score: Math.max(100 - overview.budgetUtilization, 0),
          weight: 0.25,
          description: 'How well you stick to budgets',
        },
        {
          name: 'Goal Progress',
          score: Math.min(overview.goalProgress, 100),
          weight: 0.2,
          description: 'Progress towards financial goals',
        },
        {
          name: 'Income Stability',
          score: overview.totalIncome > 0 ? 85 : 0, // Simplified - would analyze income consistency
          weight: 0.15,
          description: 'Consistency of income streams',
        },
        {
          name: 'Expense Control',
          score: overview.totalExpenses > 0 ? Math.max(100 - (overview.totalExpenses / overview.totalIncome * 100), 0) : 100,
          weight: 0.1,
          description: 'Control over spending habits',
        },
      ];

      const weightedScore = factors.reduce((sum, factor) => 
        sum + (factor.score * factor.weight), 0
      );

      const grade = this.getGradeFromScore(weightedScore);

      return {
        score: Math.round(weightedScore),
        grade,
        factors,
      };
    } catch (error) {
      this.logger.error(`Failed to calculate health score: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export financial data for user
   */
  async exportFinancialData(userId: string, format: 'csv' | 'json' | 'pdf' = 'csv'): Promise<{
    data: string;
    filename: string;
    mimeType: string;
  }> {
    try {
      // Log security event for data export
      await this.security.logSecurityEvent({
        userId,
        action: 'EXPORT_FINANCIAL_DATA',
        resource: 'financial_data',
        ipAddress: '',
        userAgent: '',
        metadata: { format },
        riskLevel: 'MEDIUM',
      });

      const [transactions, budgets, goals] = await Promise.all([
        this.transactionService.getUserTransactions(userId, 'yearly'),
        this.budgetService.getUserBudgets(userId),
        this.goalService.getUserGoals(userId),
      ]);

      const timestamp = new Date().toISOString().split('T')[0];

      switch (format) {
        case 'csv':
          const csvData = this.generateCSVExport(transactions, budgets, goals);
          return {
            data: csvData,
            filename: `financial-data-${timestamp}.csv`,
            mimeType: 'text/csv',
          };

        case 'json':
          const jsonData = JSON.stringify({
            exportDate: new Date().toISOString(),
            userId,
            transactions,
            budgets,
            goals,
          }, null, 2);
          return {
            data: jsonData,
            filename: `financial-data-${timestamp}.json`,
            mimeType: 'application/json',
          };

        case 'pdf':
          // PDF generation would be implemented here
          throw new Error('PDF export not yet implemented');

        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      this.logger.error(`Failed to export data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate financial trend
   */
  private calculateTrend(transactions: any[]): number {
    // Simplified trend calculation
    // In production, this would use more sophisticated time series analysis
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth - 1;

    const currentMonthNet = transactions
      .filter(t => new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -Math.abs(t.amount)), 0);

    const lastMonthNet = transactions
      .filter(t => new Date(t.date).getMonth() === lastMonth)
      .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -Math.abs(t.amount)), 0);

    if (lastMonthNet === 0) return 0;
    return ((currentMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100;
  }

  /**
   * Get grade from numerical score
   */
  private getGradeFromScore(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  }

  /**
   * Generate CSV export data
   */
  private generateCSVExport(transactions: any[], budgets: any[], goals: any[]): string {
    let csv = '';
    
    // Transactions section
    csv += 'TRANSACTIONS\n';
    csv += 'Date,Description,Amount,Category,Type,Status,Account\n';
    transactions.forEach(t => {
      csv += `${t.date},"${t.description}",${t.amount},${t.category},${t.type},${t.status},${t.account}\n`;
    });
    
    csv += '\nBUDGETS\n';
    csv += 'Category,Budgeted,Spent,Remaining,Period\n';
    budgets.forEach(b => {
      csv += `${b.category},${b.budgeted},${b.spent},${b.remaining},${b.period}\n`;
    });
    
    csv += '\nGOALS\n';
    csv += 'Name,Target Amount,Current Amount,Target Date,Category,Priority\n';
    goals.forEach(g => {
      csv += `"${g.name}",${g.targetAmount},${g.currentAmount},${g.targetDate},${g.category},${g.priority}\n`;
    });
    
    return csv;
  }

  /**
   * Validate financial data integrity
   */
  async validateDataIntegrity(userId: string): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];

      const transactions = await this.transactionService.getUserTransactions(userId, 'yearly');
      const budgets = await this.budgetService.getUserBudgets(userId);

      // Check for duplicate transactions
      const transactionHashes = new Map();
      transactions.forEach(t => {
        const hash = `${t.date}-${t.amount}-${t.description}`;
        if (transactionHashes.has(hash)) {
          issues.push(`Potential duplicate transaction: ${t.description} on ${t.date}`);
        }
        transactionHashes.set(hash, true);
      });

      // Check for unusual amounts
      const amounts = transactions.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
      const unusualThreshold = avgAmount * 10;
      
      transactions.forEach(t => {
        if (Math.abs(t.amount) > unusualThreshold) {
          issues.push(`Unusually large transaction: ${t.description} - $${Math.abs(t.amount)}`);
        }
      });

      // Check budget consistency
      budgets.forEach(b => {
        if (b.spent > b.budgeted * 1.5) {
          issues.push(`Budget significantly exceeded for ${b.category}: ${((b.spent / b.budgeted - 1) * 100).toFixed(1)}% over`);
          recommendations.push(`Consider increasing budget for ${b.category} or reducing spending`);
        }
      });

      return {
        isValid: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      this.logger.error(`Data integrity validation failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

export interface CreateTransactionDto {
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date?: Date;
}

export interface CreateFinancialDataDto {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debt: number;
  investments: number;
  creditScore: number;
  portfolioValue: number;
  monthlyGrowth: number;
}

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: Date;
  description?: string;
}

export interface CreateBudgetDto {
  name: string;
  limit: number;
  category: string;
  period: 'monthly' | 'weekly' | 'yearly';
}

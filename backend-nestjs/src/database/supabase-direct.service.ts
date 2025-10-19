import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseDirectService {
  private readonly logger = new Logger(SupabaseDirectService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseServiceKey: string;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    this.supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');
  }

  // Direct API call to Supabase REST API
  private async makeRequest(endpoint: string, method: string = 'GET', body?: any) {
    const url = `${this.supabaseUrl}/rest/v1/${endpoint}`;
    
    const headers = {
      'apikey': this.supabaseServiceKey,
      'Authorization': `Bearer ${this.supabaseServiceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Supabase API request failed: ${error.message}`);
      throw error;
    }
  }

  // Create tables using SQL
  async createTables() {
    const createTablesSQL = `
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified BOOLEAN DEFAULT FALSE,
        password VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create transactions table
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(15,2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
        date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        merchant_name VARCHAR(255),
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create goals table
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        target_amount DECIMAL(15,2) NOT NULL,
        current_amount DECIMAL(15,2) DEFAULT 0,
        target_date DATE,
        category VARCHAR(100),
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create financial_data table for summaries
      CREATE TABLE IF NOT EXISTS financial_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        total_balance DECIMAL(15,2) DEFAULT 0,
        monthly_income DECIMAL(15,2) DEFAULT 0,
        monthly_expenses DECIMAL(15,2) DEFAULT 0,
        savings DECIMAL(15,2) DEFAULT 0,
        debt DECIMAL(15,2) DEFAULT 0,
        investments DECIMAL(15,2) DEFAULT 0,
        credit_score INTEGER DEFAULT 0,
        portfolio_value DECIMAL(15,2) DEFAULT 0,
        monthly_growth DECIMAL(15,2) DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
      CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
    `;

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseServiceKey,
          'Authorization': `Bearer ${this.supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: createTablesSQL })
      });

      if (response.ok) {
        this.logger.log('Database tables created successfully');
        return true;
      } else {
        this.logger.error('Failed to create tables:', await response.text());
        return false;
      }
    } catch (error) {
      this.logger.error('Error creating tables:', error);
      return false;
    }
  }

  // Add transaction
  async addTransaction(userId: string, transaction: any) {
    return this.makeRequest('transactions', 'POST', {
      user_id: userId,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date || new Date().toISOString(),
      merchant_name: transaction.merchantName,
      tags: transaction.tags || []
    });
  }

  // Get transactions for user
  async getTransactions(userId: string, options: any = {}) {
    let query = `transactions?user_id=eq.${userId}&order=date.desc`;
    
    if (options.limit) {
      query += `&limit=${options.limit}`;
    }
    
    if (options.category) {
      query += `&category=ilike.%${options.category}%`;
    }
    
    if (options.type) {
      query += `&type=eq.${options.type}`;
    }

    return this.makeRequest(query);
  }

  // Get financial summary
  async getFinancialSummary(userId: string) {
    const transactions = await this.getTransactions(userId);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const netSavings = totalIncome - totalExpenses;
    
    // Calculate monthly averages (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= twelveMonthsAgo
    );
    
    const monthlyIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) / 12;
    
    const monthlyExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) / 12;
    
    // Calculate top categories
    const categoryTotals = new Map();
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryTotals.get(t.category) || 0;
        categoryTotals.set(t.category, current + parseFloat(t.amount));
      });
    
    const topCategories = Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalExpenses) * 100
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return {
      totalIncome,
      totalExpenses,
      netSavings,
      monthlyIncome,
      monthlyExpenses,
      topCategories,
      recentTransactions: transactions.slice(0, 10)
    };
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('users?limit=1');
      this.logger.log('Supabase connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Supabase connection test failed:', error.message);
      return false;
    }
  }
}

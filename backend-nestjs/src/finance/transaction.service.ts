import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { EncryptionService } from '../security/encryption.service';

export interface CreateTransactionDto {
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  type: 'INCOME' | 'EXPENSE';
  account: string;
  date?: Date;
  tags?: string[];
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  type: 'INCOME' | 'EXPENSE';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  account: string;
  date: Date;
  tags: string[];
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private prisma: PrismaService,
    private security: SecurityService,
    private encryption: EncryptionService,
  ) {}

  /**
   * Create a new transaction with encryption and security logging
   */
  async createTransaction(userId: string, data: CreateTransactionDto, ipAddress: string): Promise<Transaction> {
    try {
      // Validate transaction data
      this.validateTransactionData(data);

      // Encrypt sensitive data
      const encryptedNotes = data.notes ? await this.encryption.encryptField(data.notes, 'notes') : undefined;
      const encryptedDescription = await this.encryption.encryptField(data.description, 'description');

      const newTransaction = await this.prisma.transaction.create({
        data: {
          userId,
          description: encryptedDescription,
          amount: data.amount,
          category: data.category,
          subcategory: data.subcategory,
          type: data.type.toLowerCase(),
          account: data.account,
          date: data.date || new Date(),
          tags: data.tags || [],
          notes: encryptedNotes,
          isReconciled: false,
        },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'CREATE_TRANSACTION',
        resource: 'transaction',
        ipAddress,
        userAgent: '',
        metadata: { 
          transactionId: newTransaction.id, 
          amount: data.amount, 
          category: data.category,
          type: data.type 
        },
        riskLevel: 'LOW',
      });

      return this.mapTransaction(newTransaction);
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get user transactions with filtering and pagination
   */
  async getUserTransactions(
    userId: string,
    period: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    category?: string,
    type?: 'INCOME' | 'EXPENSE',
    limit: number = 100,
    offset: number = 0
  ): Promise<Transaction[]> {
    try {
      const startDate = this.getStartDateForPeriod(period);
      
      const where: any = {
        userId,
        date: {
          gte: startDate,
        },
      };

      if (category) where.category = category;
      if (type) where.type = type;

      const transactions = await this.prisma.transaction.findMany({
        where,
        orderBy: {
          date: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return Promise.all(transactions.map(t => this.mapTransaction(t)));
    } catch (error) {
      this.logger.error(`Failed to get transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    userId: string,
    transactionId: string,
    data: Partial<CreateTransactionDto>,
    ipAddress: string
  ): Promise<Transaction> {
    try {
      // Verify transaction belongs to user
      const existingTransaction = await this.prisma.transaction.findFirst({
        where: { id: transactionId, userId },
      });

      if (!existingTransaction) {
        throw new BadRequestException('Transaction not found');
      }

      // Prepare update data
      const updateData: any = {};
      
      if (data.description) {
        updateData.description = await this.encryption.encryptField(data.description, 'description');
      }
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.category) updateData.category = data.category;
      if (data.subcategory) updateData.subcategory = data.subcategory;
      if (data.type) updateData.type = data.type;
      if (data.account) updateData.account = data.account;
      if (data.date) updateData.date = data.date;
      if (data.tags) updateData.tags = data.tags;
      if (data.notes) {
        updateData.notes = await this.encryption.encryptField(data.notes, 'notes');
      }
      if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
      if (data.recurringFrequency) updateData.recurringFrequency = data.recurringFrequency;

      const updatedTransaction = await this.prisma.transaction.update({
        where: { id: transactionId },
        data: updateData,
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'UPDATE_TRANSACTION',
        resource: 'transaction',
        ipAddress,
        userAgent: '',
        metadata: {
          transactionId,
          changes: Object.keys(updateData),
        },
        riskLevel: 'MEDIUM',
      });

      return this.mapTransaction(transaction);
    } catch (error) {
      this.logger.error(`Failed to update transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(userId: string, transactionId: string, ipAddress: string): Promise<void> {
    try {
      // Verify transaction belongs to user
      const transaction = await this.prisma.transaction.findFirst({
        where: { id: transactionId, userId },
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      await this.prisma.transaction.delete({
        where: { id: transactionId },
      });

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'DELETE_TRANSACTION',
        resource: 'transaction',
        ipAddress,
        userAgent: '',
        metadata: {
          transactionId,
          amount: transaction.amount,
          category: transaction.category,
        },
        riskLevel: 'HIGH',
      });

      this.logger.log(`Transaction deleted: ${transactionId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get transaction analytics
   */
  async getTransactionAnalytics(userId: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly'): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    transactionCount: number;
    averageTransaction: number;
    categoryBreakdown: Record<string, { amount: number; count: number; percentage: number }>;
    monthlyTrend: Array<{ month: string; income: number; expenses: number; net: number }>;
  }> {
    try {
      const transactions = await this.getUserTransactions(userId, period);
      
      const income = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const netIncome = income - expenses;
      const transactionCount = transactions.length;
      const averageTransaction = transactionCount > 0 ? (income + expenses) / transactionCount : 0;

      // Category breakdown
      const categoryBreakdown: Record<string, { amount: number; count: number; percentage: number }> = {};
      const totalAmount = income + expenses;

      transactions.forEach(t => {
        const amount = Math.abs(t.amount);
        if (!categoryBreakdown[t.category]) {
          categoryBreakdown[t.category] = { amount: 0, count: 0, percentage: 0 };
        }
        categoryBreakdown[t.category].amount += amount;
        categoryBreakdown[t.category].count += 1;
      });

      Object.keys(categoryBreakdown).forEach(category => {
        categoryBreakdown[category].percentage = totalAmount > 0 
          ? (categoryBreakdown[category].amount / totalAmount) * 100 
          : 0;
      });

      // Monthly trend (simplified)
      const monthlyTrend = this.calculateMonthlyTrend(transactions);

      return {
        totalIncome: income,
        totalExpenses: expenses,
        netIncome,
        transactionCount,
        averageTransaction,
        categoryBreakdown,
        monthlyTrend,
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Import transactions from CSV
   */
  async importTransactions(userId: string, csvData: string, ipAddress: string): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      let imported = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const transactionData = this.parseCSVRow(headers, values);
          
          await this.createTransaction(userId, transactionData, ipAddress);
          imported++;
        } catch (error) {
          failed++;
          errors.push(`Line ${i + 1}: ${error.message}`);
        }
      }

      // Log security event
      await this.security.logSecurityEvent({
        userId,
        action: 'IMPORT_TRANSACTIONS',
        resource: 'transaction',
        ipAddress,
        userAgent: '',
        metadata: {
          imported,
          failed,
          totalLines: lines.length - 1,
        },
        riskLevel: 'MEDIUM',
      });

      return { imported, failed, errors };
    } catch (error) {
      this.logger.error(`Failed to import transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get recurring transactions
   */
  async getRecurringTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          isRecurring: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      return Promise.all(transactions.map(t => this.mapTransaction(t)));
    } catch (error) {
      this.logger.error(`Failed to get recurring transactions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process recurring transactions
   */
  async processRecurringTransactions(): Promise<void> {
    try {
      const recurringTransactions = await this.prisma.transaction.findMany({
        where: {
          isRecurring: true,
          status: 'COMPLETED',
        },
      });

      for (const transaction of recurringTransactions) {
        const nextDate = this.calculateNextRecurringDate(transaction.date, transaction.recurringFrequency);
        
        if (nextDate <= new Date()) {
          // Create next recurring transaction
          await this.prisma.transaction.create({
            data: {
              userId: transaction.userId,
              description: transaction.description,
              amount: transaction.amount,
              category: transaction.category,
              subcategory: transaction.subcategory,
              type: transaction.type,
              status: 'COMPLETED',
              account: transaction.account,
              date: nextDate,
              tags: transaction.tags,
              notes: transaction.notes,
              isRecurring: true,
              recurringFrequency: transaction.recurringFrequency,
            },
          });
        }
      }

      this.logger.log('Processed recurring transactions');
    } catch (error) {
      this.logger.error(`Failed to process recurring transactions: ${error.message}`, error.stack);
    }
  }

  /**
   * Validate transaction data
   */
  private validateTransactionData(data: CreateTransactionDto): void {
    if (!data.description || data.description.trim().length === 0) {
      throw new BadRequestException('Description is required');
    }

    if (data.amount === 0) {
      throw new BadRequestException('Amount cannot be zero');
    }

    if (!data.category || data.category.trim().length === 0) {
      throw new BadRequestException('Category is required');
    }

    if (!data.account || data.account.trim().length === 0) {
      throw new BadRequestException('Account is required');
    }

    if (!['INCOME', 'EXPENSE'].includes(data.type)) {
      throw new BadRequestException('Type must be INCOME or EXPENSE');
    }

    // Ensure expenses are negative
    if (data.type === 'EXPENSE' && data.amount > 0) {
      data.amount = -Math.abs(data.amount);
    }

    // Ensure income is positive
    if (data.type === 'INCOME' && data.amount < 0) {
      data.amount = Math.abs(data.amount);
    }
  }

  /**
   * Map database transaction to service transaction
   */
  private async mapTransaction(dbTransaction: any): Promise<Transaction> {
    const decryptedDescription = await this.encryption.decryptField(dbTransaction.description, 'description');
    const decryptedNotes = dbTransaction.notes 
      ? await this.encryption.decryptField(dbTransaction.notes, 'notes')
      : null;

    return {
      id: dbTransaction.id,
      userId: dbTransaction.userId,
      description: decryptedDescription,
      amount: dbTransaction.amount,
      category: dbTransaction.category,
      subcategory: dbTransaction.subcategory,
      type: dbTransaction.type,
      status: dbTransaction.status,
      account: dbTransaction.account,
      date: dbTransaction.date,
      tags: dbTransaction.tags || [],
      notes: decryptedNotes,
      isRecurring: dbTransaction.isRecurring,
      recurringFrequency: dbTransaction.recurringFrequency,
      createdAt: dbTransaction.createdAt,
      updatedAt: dbTransaction.updatedAt,
    };
  }

  /**
   * Get start date for period
   */
  private getStartDateForPeriod(period: 'monthly' | 'quarterly' | 'yearly'): Date {
    const now = new Date();
    
    switch (period) {
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'yearly':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  /**
   * Calculate monthly trend
   */
  private calculateMonthlyTrend(transactions: Transaction[]): Array<{ month: string; income: number; expenses: number; net: number }> {
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    transactions.forEach(t => {
      const monthKey = t.date.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (t.type === 'INCOME') {
        monthlyData[monthKey].income += t.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(t.amount);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }));
  }

  /**
   * Parse CSV row into transaction data
   */
  private parseCSVRow(headers: string[], values: string[]): CreateTransactionDto {
    const data: any = {};
    
    headers.forEach((header, index) => {
      if (values[index]) {
        switch (header) {
          case 'date':
            data.date = new Date(values[index]);
            break;
          case 'description':
            data.description = values[index];
            break;
          case 'amount':
            data.amount = parseFloat(values[index]);
            break;
          case 'category':
            data.category = values[index];
            break;
          case 'type':
            data.type = values[index].toUpperCase();
            break;
          case 'account':
            data.account = values[index];
            break;
          default:
            data[header] = values[index];
        }
      }
    });

    return data;
  }

  /**
   * Calculate next recurring date
   */
  private calculateNextRecurringDate(lastDate: Date, frequency: string): Date {
    const next = new Date(lastDate);
    
    switch (frequency) {
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1); // Default to monthly
    }
    
    return next;
  }
}

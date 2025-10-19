import { supabase } from '@/lib/supabase'
import type { UserProfile, Transaction, Account, Investment, Goal, Budget, Reminder } from '@/lib/supabase'

export class DatabaseService {
  
  // ==================== USER PROFILE ====================
  
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      return false
    }
  }

  // ==================== TRANSACTIONS ====================
  
  static async getTransactions(userId: string, limit = 100): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  static async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding transaction:', error)
      return null
    }
  }

  static async updateTransaction(id: string, updates: Partial<Transaction>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating transaction:', error)
      return false
    }
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      return false
    }
  }

  // ==================== ACCOUNTS ====================
  
  static async getAccounts(userId: string): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching accounts:', error)
      return []
    }
  }

  static async addAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account | null> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...account,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding account:', error)
      return null
    }
  }

  static async updateAccountBalance(id: string, balance: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating account balance:', error)
      return false
    }
  }

  // ==================== INVESTMENTS ====================
  
  static async getInvestments(userId: string): Promise<Investment[]> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('market_value', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching investments:', error)
      return []
    }
  }

  static async addInvestment(investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<Investment | null> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert({
          ...investment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding investment:', error)
      return null
    }
  }

  // ==================== GOALS ====================
  
  static async getGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching goals:', error)
      return []
    }
  }

  static async addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding goal:', error)
      return null
    }
  }

  static async updateGoalProgress(id: string, currentAmount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ current_amount: currentAmount, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating goal progress:', error)
      return false
    }
  }

  // ==================== BUDGETS ====================
  
  static async getBudgets(userId: string): Promise<Budget[]> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching budgets:', error)
      return []
    }
  }

  static async addBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget | null> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budget,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding budget:', error)
      return null
    }
  }

  static async updateBudgetSpent(id: string, spentAmount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budgets')
        .update({ spent_amount: spentAmount, updated_at: new Date().toISOString() })
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating budget spent amount:', error)
      return false
    }
  }

  // ==================== ANALYTICS ====================
  
  static async getFinancialSummary(userId: string): Promise<{
    totalIncome: number
    totalExpenses: number
    netWorth: number
    savingsRate: number
    topSpendingCategories: { category: string; amount: number }[]
    monthlyTrend: { month: string; income: number; expenses: number }[]
  }> {
    try {
      // Get transactions for the last 12 months
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
      
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', twelveMonthsAgo.toISOString())
      
      if (transError) throw transError

      // Get accounts
      const { data: accounts, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
      
      if (accountError) throw accountError

      // Get investments
      const { data: investments, error: invError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
      
      if (invError) throw invError

      // Calculate metrics
      const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0
      const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0
      const accountBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) || 0
      const investmentValue = investments?.reduce((sum, i) => sum + i.market_value, 0) || 0
      const netWorth = accountBalance + investmentValue
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

      // Top spending categories
      const categorySpending = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>) || {}

      const topSpendingCategories = Object.entries(categorySpending)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)

      // Monthly trend (last 6 months)
      const monthlyTrend = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthTransactions = transactions?.filter(t => {
          const tDate = new Date(t.date)
          return tDate >= monthStart && tDate <= monthEnd
        }) || []

        const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
        const monthExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

        monthlyTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: monthIncome,
          expenses: monthExpenses
        })
      }

      return {
        totalIncome,
        totalExpenses,
        netWorth,
        savingsRate,
        topSpendingCategories,
        monthlyTrend
      }
    } catch (error) {
      console.error('Error getting financial summary:', error)
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netWorth: 0,
        savingsRate: 0,
        topSpendingCategories: [],
        monthlyTrend: []
      }
    }
  }

  // ==================== REMINDERS ====================
  
  static async getReminders(userId: string): Promise<Reminder[]> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('due_date', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reminders:', error)
      return []
    }
  }

  static async addReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding reminder:', error)
      return null
    }
  }
}

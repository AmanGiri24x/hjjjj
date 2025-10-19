'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import financialService, { type FinancialSummary } from '@/lib/services/financialService'
import type { Transaction, Goal, Budget, Reminder, Investment, Account } from '@/lib/supabase'

export interface FinancialData extends FinancialSummary {
  isNewUser: boolean
  creditScore: number
}

export interface TransactionInput {
  description: string
  amount: number
  category: string
  date: string
  type: 'income' | 'expense'
  account_id?: string
}

export interface GoalInput {
  name: string
  target_amount: number
  category: string
  target_date?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface BudgetInput {
  name: string
  category: string
  limit_amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string
}

export interface ReminderInput {
  title: string
  description?: string
  type: 'bill' | 'emi' | 'subscription' | 'goal' | 'investment'
  amount?: number
  due_date: string
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly'
}

interface FinancialContextType {
  financialData: FinancialData | null
  transactions: Transaction[]
  goals: Goal[]
  budgets: Budget[]
  reminders: Reminder[]
  investments: Investment[]
  accounts: Account[]
  isLoading: boolean
  isNewUser: boolean
  error: string | null
  
  // Actions
  addTransaction: (transaction: TransactionInput) => Promise<void>
  addGoal: (goal: GoalInput) => Promise<void>
  addBudget: (budget: BudgetInput) => Promise<void>
  addReminder: (reminder: ReminderInput) => Promise<void>
  addInvestment: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  addAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>
  
  deleteTransaction: (id: string) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  
  refreshData: () => Promise<void>
  initializeUserData: () => Promise<void>
  updateFinancialData: (updates: Partial<FinancialData>) => void
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export const useFinancial = () => {
  const context = useContext(FinancialContext)
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider')
  }
  return context
}

// Helper function for localStorage
const saveToStorage = (userId: string, key: string, data: any) => {
  try {
    localStorage.setItem(`${userId}_${key}`, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to storage:', error)
  }
}

const loadFromStorage = (userId: string, key: string) => {
  try {
    const data = localStorage.getItem(`${userId}_${key}`)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to load from storage:', error)
    return null
  }
}

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    } else {
      // Reset state when not authenticated
      resetState()
    }
  }, [isAuthenticated, user])

  const resetState = () => {
    setFinancialData(null)
    setTransactions([])
    setGoals([])
    setBudgets([])
    setReminders([])
    setInvestments([])
    setAccounts([])
    setIsNewUser(false)
    setError(null)
  }

  const loadUserData = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Load all data in parallel
      const [summary, transactionsData, goalsData, budgetsData, remindersData, investmentsData, accountsData] = await Promise.all([
        financialService.getFinancialSummary(),
        financialService.getTransactions(100),
        financialService.getGoals(),
        financialService.getBudgets(),
        financialService.getReminders(),
        financialService.getInvestments(),
        financialService.getAccounts()
      ])

      // Check if user has any data
      const hasData = transactionsData.length > 0 || goalsData.length > 0 || investmentsData.length > 0
      
      setFinancialData({
        ...summary,
        isNewUser: !hasData,
        creditScore: 750 // This would come from a credit scoring service
      })
      
      setTransactions(transactionsData)
      setGoals(goalsData)
      setBudgets(budgetsData)
      setReminders(remindersData)
      setInvestments(investmentsData)
      setAccounts(accountsData)
      setIsNewUser(!hasData)
      
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load financial data')
      setIsNewUser(true)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    await loadUserData()
  }

  // Transaction methods
  const addTransaction = async (transactionInput: TransactionInput) => {
    try {
      setError(null)
      const newTransaction = await financialService.createTransaction(transactionInput)
      setTransactions(prev => [newTransaction, ...prev])
      await refreshData() // Refresh to update summary
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction')
      throw err
    }
  }

  const addGoal = async (goal: GoalInput) => {
    if (!user?.email) return

    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      user_id: user.id || user.email,
      current_amount: 0,
      target_date: goal.target_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      description: '',
      priority: goal.priority || 'medium',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const updatedGoals = [...goals, newGoal]
    setGoals(updatedGoals)
    saveToStorage(user.email, 'goals', updatedGoals)

    // Mark user as no longer new
    if (financialData) {
      const updatedFinancialData = { ...financialData, isNewUser: false }
      setFinancialData(updatedFinancialData)
      saveToStorage(user.email, 'financial_data', updatedFinancialData)
    }
  }

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user?.email) return

    const updatedGoals = goals.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    )
    setGoals(updatedGoals)
    saveToStorage(user.id, 'goals', updatedGoals)
  }

  const addBudget = async (budget: BudgetInput) => {
    if (!user?.email) return

    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      user_id: user.id || user.email,
      spent_amount: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const updatedBudgets = [...budgets, newBudget]
    setBudgets(updatedBudgets)
    saveToStorage(user.email, 'budgets', updatedBudgets)

    // Mark user as no longer new
    if (financialData) {
      const updatedFinancialData = { ...financialData, isNewUser: false }
      setFinancialData(updatedFinancialData)
      saveToStorage(user.email, 'financial_data', updatedFinancialData)
    }
  }

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user?.email) return

    const updatedBudgets = budgets.map(budget => 
      budget.id === id ? { ...budget, ...updates } : budget
    )
    setBudgets(updatedBudgets)
    saveToStorage(user.id, 'budgets', updatedBudgets)
  }

  const updateFinancialData = (updates: Partial<FinancialData>) => {
    if (!user?.email || !financialData) return

    const updatedData = { ...financialData, ...updates, isNewUser: false }
    setFinancialData(updatedData)
    saveToStorage(user.email, 'financial_data', updatedData)
  }

  const initializeUserData = async () => {
    if (!user?.email) return

    const initialData: FinancialData = {
      totalIncome: 0,
      totalExpenses: 0,
      netWorth: 0,
      savings: 0,
      investments: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      portfolioValue: 0,
      monthlyGrowth: 0,
      debt: 0,
      creditScore: 0,
      isNewUser: false
    }
    
    setFinancialData(initialData)
    saveToStorage(user.email, 'financial_data', initialData)
    setIsNewUser(false)
  }

  return (
    <FinancialContext.Provider value={{
      financialData,
      transactions,
      goals,
      budgets,
      reminders,
      investments,
      accounts,
      isLoading,
      isNewUser,
      error,
      addTransaction,
      addGoal,
      addBudget,
      addReminder: async () => {},
      addInvestment: async () => {},
      addAccount: async () => {},
      updateTransaction: async () => {},
      updateGoal,
      updateBudget,
      updateInvestment: async () => {},
      deleteTransaction: async () => {},
      deleteGoal: async () => {},
      refreshData,
      initializeUserData,
      updateFinancialData
    }}>
      {children}
    </FinancialContext.Provider>
  )
}

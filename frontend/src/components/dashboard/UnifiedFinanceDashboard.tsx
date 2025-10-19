'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign, TrendingUp, TrendingDown, Target, PieChart, BarChart3, Activity, 
  Plus, Wallet, CreditCard, MessageCircle, ArrowUpRight, ArrowDownRight,
  Calendar, Filter, Download, Settings, Bell, Eye, EyeOff, ChevronRight,
  Home, Receipt, Calculator, Brain, Zap, ArrowLeft, CheckCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { DatabaseService } from '@/services/database'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, ArcElement, BarElement,
} from 'chart.js'
import type { Transaction, Account, Investment, Goal as GoalType, Budget } from '@/lib/supabase'
import AdvancedFinnyAI from '@/components/ai/AdvancedFinnyAI'
import QuickTransactionForm from '@/components/transactions/QuickTransactionForm'
import QuickGoalForm from '@/components/goals/QuickGoalForm'
import QuickBudgetForm from '@/components/budget/QuickBudgetForm'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netWorth: number
  savingsRate: number
  topSpendingCategories: { category: string; amount: number }[]
  monthlyTrend: { month: string; income: number; expenses: number }[]
}

type DashboardView = 'overview' | 'income' | 'expenses' | 'goals' | 'budget' | 'accounts'

export default function UnifiedFinanceDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<DashboardView>('overview')
  const [showValues, setShowValues] = useState(true)
  const [showFinnyChat, setShowFinnyChat] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddBudget, setShowAddBudget] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [goals, setGoals] = useState<GoalType[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    savingsRate: 0,
    topSpendingCategories: [],
    monthlyTrend: []
  })

  useEffect(() => {
    if (user?.id) {
      loadAllData()
    }
  }, [user?.id])

  const loadAllData = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const [
        transactionsData,
        accountsData,
        investmentsData,
        goalsData,
        budgetsData,
        summaryData
      ] = await Promise.all([
        DatabaseService.getTransactions(user.id),
        DatabaseService.getAccounts(user.id),
        DatabaseService.getInvestments(user.id),
        DatabaseService.getGoals(user.id),
        DatabaseService.getBudgets(user.id),
        DatabaseService.getFinancialSummary(user.id)
      ])

      setTransactions(transactionsData)
      setAccounts(accountsData)
      setInvestments(investmentsData)
      setGoals(goalsData)
      setBudgets(budgetsData)
      setFinancialSummary(summaryData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (!showValues) return '••••••'
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const formatPercentage = (value: number) => {
    if (!showValues) return '••••'
    return `${value.toFixed(1)}%`
  }

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'blue' },
    { id: 'income', label: 'Income', icon: TrendingUp, color: 'green' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, color: 'red' },
    { id: 'goals', label: 'Goals', icon: Target, color: 'purple' },
    { id: 'budget', label: 'Budget', icon: Calculator, color: 'orange' },
    { id: 'accounts', label: 'Accounts', icon: Wallet, color: 'indigo' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Personal Finance Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.first_name || 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowValues(!showValues)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={showValues ? 'Hide values' : 'Show values'}
              >
                {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setShowFinnyChat(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <Brain className="w-4 h-4" />
                <span>Ask Finny</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as DashboardView)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? `bg-${item.color}-500 text-white shadow-lg`
                      : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Overview Dashboard */}
        {currentView === 'overview' && (
          <OverviewDashboard 
            financialSummary={financialSummary}
            accounts={accounts}
            investments={investments}
            goals={goals}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
        )}

        {/* Income Management */}
        {currentView === 'income' && (
          <IncomeManagement 
            transactions={transactions.filter(t => t.type === 'income')}
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
            onRefresh={loadAllData}
          />
        )}

        {/* Expense Management */}
        {currentView === 'expenses' && (
          <ExpenseManagement 
            transactions={transactions.filter(t => t.type === 'expense')}
            financialSummary={financialSummary}
            formatCurrency={formatCurrency}
            onRefresh={loadAllData}
          />
        )}

        {/* Goals Management */}
        {currentView === 'goals' && (
          <GoalsManagement 
            goals={goals}
            formatCurrency={formatCurrency}
            onRefresh={loadAllData}
          />
        )}

        {/* Budget Planner */}
        {currentView === 'budget' && (
          <BudgetPlanner 
            budgets={budgets}
            transactions={transactions}
            formatCurrency={formatCurrency}
            onRefresh={loadAllData}
          />
        )}

        {/* Accounts Overview */}
        {currentView === 'accounts' && (
          <AccountsOverview 
            accounts={accounts}
            investments={investments}
            formatCurrency={formatCurrency}
            onRefresh={loadAllData}
          />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Finny Chat Modal */}
        {showFinnyChat && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
            onClick={() => setShowFinnyChat(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden" 
              onClick={(e) => e.stopPropagation()}
            >
              <FinnyAIChat 
                onClose={() => setShowFinnyChat(false)}
                userData={{
                  transactions,
                  accounts,
                  investments,
                  goals,
                  budgets,
                  financialSummary
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <QuickTransactionForm 
            onClose={() => setShowAddTransaction(false)}
            onSuccess={() => {
              loadAllData() // Refresh data after adding transaction
            }}
          />
        )}

        {/* Add Goal Modal */}
        {showAddGoal && (
          <QuickGoalForm 
            onClose={() => setShowAddGoal(false)}
            onSuccess={() => {
              loadAllData() // Refresh data after adding goal
            }}
          />
        )}

        {/* Add Budget Modal */}
        {showAddBudget && (
          <QuickBudgetForm 
            onClose={() => setShowAddBudget(false)}
            onSuccess={() => {
              loadAllData() // Refresh data after adding budget
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Overview Dashboard Component
function OverviewDashboard({ 
  financialSummary, 
  accounts, 
  investments, 
  goals, 
  formatCurrency, 
  formatPercentage 
}: {
  financialSummary: FinancialSummary
  accounts: Account[]
  investments: Investment[]
  goals: GoalType[]
  formatCurrency: (amount: number) => string
  formatPercentage: (value: number) => string
}) {
  // Chart data for monthly trend
  const monthlyTrendData = {
    labels: financialSummary.monthlyTrend.map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: financialSummary.monthlyTrend.map(m => m.income),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Expenses',
        data: financialSummary.monthlyTrend.map(m => m.expenses),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  // Chart data for spending categories
  const spendingData = {
    labels: financialSummary.topSpendingCategories.map(c => c.category),
    datasets: [{
      data: financialSummary.topSpendingCategories.map(c => c.amount),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Net Worth</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(financialSummary.netWorth)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5% from last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(financialSummary.totalIncome)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">Regular income stream</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(financialSummary.totalExpenses)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">Track spending patterns</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercentage(financialSummary.savingsRate)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Zap className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">Excellent progress!</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses Trend</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64">
            <Line 
              data={monthlyTrendData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' as const },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${Number(value).toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Spending Categories Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Spending Categories</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64">
            {financialSummary.topSpendingCategories.length > 0 ? (
              <Doughnut 
                data={spendingData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' as const },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ₹${context.parsed.toLocaleString()}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No expense data yet</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowAddTransaction(true)}
              className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Add Transaction</span>
            </button>
            <button 
              onClick={() => setShowAddGoal(true)}
              className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Target className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Set New Goal</span>
            </button>
            <button 
              onClick={() => setShowAddBudget(true)}
              className="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Calculator className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700 font-medium">Create Budget</span>
            </button>
          </div>
        </motion.div>

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Goals</h3>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </div>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const progress = (goal.current_amount / goal.target_amount) * 100
                return (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <span className="text-sm text-gray-600">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}</span>
                      <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active goals yet</p>
              <button 
                onClick={() => setShowAddGoal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Set your first goal
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Income Management Component
function IncomeManagement({ 
  transactions, 
  financialSummary, 
  formatCurrency, 
  onRefresh 
}: {
  transactions: Transaction[]
  financialSummary: FinancialSummary
  formatCurrency: (amount: number) => string
  onRefresh: () => void
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showAddIncome, setShowAddIncome] = useState(false)

  // Calculate income metrics
  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0)
  const avgMonthlyIncome = totalIncome / Math.max(1, new Set(transactions.map(t => t.date.substring(0, 7))).size)
  
  // Group income by category
  const incomeByCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  // Group income by month
  const incomeByMonth = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  // Chart data for income categories
  const categoryChartData = {
    labels: Object.keys(incomeByCategory),
    datasets: [{
      data: Object.values(incomeByCategory),
      backgroundColor: [
        '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#06B6D4', '#84CC16'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  // Chart data for monthly income trend
  const monthlyTrendData = {
    labels: Object.keys(incomeByMonth),
    datasets: [{
      label: 'Monthly Income',
      data: Object.values(incomeByMonth),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }

  return (
    <div className="space-y-6">
      {/* Income Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">All time earnings</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Monthly</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(avgMonthlyIncome)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Activity className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-blue-600">Monthly average</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Income Sources</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{Object.keys(incomeByCategory).length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Zap className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">Diversified income</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Income by Category</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64">
            {Object.keys(incomeByCategory).length > 0 ? (
              <Doughnut 
                data={categoryChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' as const },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No income data yet</p>
                  <button 
                    onClick={() => setShowAddIncome(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add your first income
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Income Trend</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64">
            {Object.keys(incomeByMonth).length > 0 ? (
              <Line 
                data={monthlyTrendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Income: ${formatCurrency(context.parsed.y)}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${Number(value).toLocaleString()}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trend data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Income Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Income</h3>
          <button
            onClick={() => setShowAddIncome(true)}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(transaction.amount)}</p>
                  <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No income recorded yet</h4>
            <p className="mb-4">Start tracking your income to see detailed analytics</p>
            <button
              onClick={() => setShowAddIncome(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Your First Income
            </button>
          </div>
        )}
      </motion.div>

      {/* Income Categories Breakdown */}
      {Object.keys(incomeByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income Breakdown by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(incomeByCategory).map(([category, amount]) => {
              const percentage = (amount / totalIncome) * 100
              return (
                <div key={category} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category}</h4>
                    <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                  </div>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(amount)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Add Income Modal */}
      {showAddIncome && (
        <QuickTransactionForm 
          onClose={() => setShowAddIncome(false)}
          onSuccess={() => {
            onRefresh() // Refresh data after adding income
          }}
        />
      )}
    </div>
  )
}

// Expense Management Component
function ExpenseManagement({ 
  transactions, 
  financialSummary, 
  formatCurrency, 
  onRefresh 
}: {
  transactions: Transaction[]
  financialSummary: FinancialSummary
  formatCurrency: (amount: number) => string
  onRefresh: () => void
}) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showAddExpense, setShowAddExpense] = useState(false)

  // Calculate expense metrics
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0)
  const avgMonthlyExpenses = totalExpenses / Math.max(1, new Set(transactions.map(t => t.date.substring(0, 7))).size)
  
  // Group expenses by category
  const expensesByCategory = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  // Group expenses by month
  const expensesByMonth = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    acc[month] = (acc[month] || 0) + t.amount
    return acc
  }, {} as Record<string, number>)

  // Chart data for expense categories
  const categoryChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: [
        '#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#06B6D4', '#84CC16'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  // Chart data for monthly expense trend
  const monthlyTrendData = {
    labels: Object.keys(expensesByMonth),
    datasets: [{
      label: 'Monthly Expenses',
      data: Object.values(expensesByMonth),
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }

  return (
    <div className="space-y-6">
      {/* Expense Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            <span className="text-red-600">All time spending</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Monthly</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(avgMonthlyExpenses)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Activity className="w-4 h-4 text-orange-500 mr-1" />
            <span className="text-orange-600">Monthly average</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Categories</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{Object.keys(expensesByCategory).length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <Zap className="w-4 h-4 text-purple-500 mr-1" />
            <span className="text-purple-600">Spending areas</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Expenses by Category</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64">
            {Object.keys(expensesByCategory).length > 0 ? (
              <Doughnut 
                data={categoryChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' as const },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No expense data yet</p>
                  <button 
                    onClick={() => setShowAddExpense(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add your first expense
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Monthly Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Expense Trend</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-64">
            {Object.keys(expensesByMonth).length > 0 ? (
              <Line 
                data={monthlyTrendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `Expenses: ${formatCurrency(context.parsed.y)}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${Number(value).toLocaleString()}`
                      }
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No trend data available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Expense Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">-{formatCurrency(transaction.amount)}</p>
                  <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No expenses recorded yet</h4>
            <p className="mb-4">Start tracking your expenses to see detailed analytics</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Add Your First Expense
            </button>
          </div>
        )}
      </motion.div>

      {/* Expense Categories Breakdown */}
      {Object.keys(expensesByCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(expensesByCategory).map(([category, amount]) => {
              const percentage = (amount / totalExpenses) * 100
              return (
                <div key={category} className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category}</h4>
                    <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                  </div>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(amount)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <QuickTransactionForm 
          onClose={() => setShowAddExpense(false)}
          onSuccess={() => {
            onRefresh() // Refresh data after adding expense
          }}
        />
      )}
    </div>
  )
}

// Goals Management Component
function GoalsManagement({ 
  goals, 
  formatCurrency, 
  onRefresh 
}: {
  goals: GoalType[]
  formatCurrency: (amount: number) => string
  onRefresh: () => void
}) {
  const [showAddGoal, setShowAddGoal] = useState(false)

  const getGoalIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'emergency fund': return '🚨'
      case 'house down payment': return '🏠'
      case 'car purchase': return '🚗'
      case 'vacation': return '✈️'
      case 'education': return '🎓'
      case 'wedding': return '💒'
      case 'retirement': return '🏖️'
      case 'investment': return '📈'
      case 'debt payoff': return '💳'
      default: return '🎯'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500'
    if (progress >= 50) return 'from-blue-500 to-cyan-500'
    if (progress >= 25) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Goals Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Goals</h2>
          <p className="text-gray-600 mt-1">Track and achieve your financial objectives</p>
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Target className="w-5 h-5" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Goals Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Goals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{goals.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {goals.filter(g => (g.current_amount / g.target_amount) >= 1).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Target</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {formatCurrency(goals.reduce((sum, g) => sum + g.target_amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Saved</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {formatCurrency(goals.reduce((sum, g) => sum + g.current_amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Goals List */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
            const progress = (goal.current_amount / goal.target_amount) * 100
            const remaining = goal.target_amount - goal.current_amount
            const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getGoalIcon(goal.category)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-600">{goal.category}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                    {goal.priority} priority
                  </span>
                </div>

                {goal.description && (
                  <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`bg-gradient-to-r ${getProgressColor(progress)} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Current Amount</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(goal.current_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Target Amount</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(goal.target_amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Remaining</p>
                      <p className="font-semibold text-red-600">{formatCurrency(remaining)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Days Left</p>
                      <p className={`font-semibold ${daysLeft > 30 ? 'text-green-600' : daysLeft > 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Target Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl"
        >
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Goals Set Yet</h3>
          <p className="text-gray-600 mb-6">Start your financial journey by setting your first goal</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Create Your First Goal
          </button>
        </motion.div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <QuickGoalForm 
          onClose={() => setShowAddGoal(false)}
          onSuccess={() => {
            onRefresh() // Refresh data after adding goal
          }}
        />
      )}
    </div>
  )
}

function BudgetPlanner({ budgets, transactions, formatCurrency, onRefresh }: any) {
  return <div className="text-center py-20">Budget Planner - Coming Soon</div>
}

function AccountsOverview({ accounts, investments, formatCurrency, onRefresh }: any) {
  return <div className="text-center py-20">Accounts Overview - Coming Soon</div>
}

function FinnyAIChat({ onClose, userData }: { onClose: () => void; userData: any }) {
  return <AdvancedFinnyAI onClose={onClose} userData={userData} />
}

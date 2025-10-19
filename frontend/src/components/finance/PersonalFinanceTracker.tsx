'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  Car,
  Coffee,
  ShoppingBag,
  Smartphone,
  Heart,
  BookOpen,
  Plane,
  Wallet,
  Target
} from 'lucide-react'
import BudgetManager from './BudgetManager'
import GoalTracker from './GoalTracker'

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  subcategory?: string
  date: string
  type: 'income' | 'expense'
  status: 'completed' | 'pending' | 'recurring'
  account: string
  tags?: string[]
  notes?: string
}

interface Budget {
  id: string
  category: string
  budgeted: number
  spent: number
  remaining: number
  period: 'monthly' | 'weekly' | 'yearly'
  alertThreshold: number
}

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: 'savings' | 'debt' | 'investment' | 'purchase'
  priority: 'high' | 'medium' | 'low'
  description?: string
}

const categoryIcons = {
  'Housing': Home,
  'Transportation': Car,
  'Food': Coffee,
  'Shopping': ShoppingBag,
  'Entertainment': Smartphone,
  'Healthcare': Heart,
  'Education': BookOpen,
  'Travel': Plane,
  'Income': DollarSign,
  'Investment': TrendingUp,
  'Other': Wallet
}

const categoryColors = {
  'Housing': 'from-blue-500 to-blue-600',
  'Transportation': 'from-green-500 to-green-600',
  'Food': 'from-orange-500 to-orange-600',
  'Shopping': 'from-purple-500 to-purple-600',
  'Entertainment': 'from-pink-500 to-pink-600',
  'Healthcare': 'from-red-500 to-red-600',
  'Education': 'from-indigo-500 to-indigo-600',
  'Travel': 'from-cyan-500 to-cyan-600',
  'Income': 'from-emerald-500 to-emerald-600',
  'Investment': 'from-violet-500 to-violet-600',
  'Other': 'from-slate-500 to-slate-600'
}

export default function PersonalFinanceTracker() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'goals'>('overview')
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Salary Deposit',
      amount: 8500.00,
      category: 'Income',
      date: '2024-09-15',
      type: 'income',
      status: 'completed',
      account: 'Primary Checking',
      tags: ['salary', 'monthly']
    },
    {
      id: '2',
      description: 'Rent Payment',
      amount: -2200.00,
      category: 'Housing',
      subcategory: 'Rent',
      date: '2024-09-01',
      type: 'expense',
      status: 'completed',
      account: 'Primary Checking',
      tags: ['rent', 'monthly', 'recurring']
    },
    {
      id: '3',
      description: 'Grocery Shopping',
      amount: -156.78,
      category: 'Food',
      subcategory: 'Groceries',
      date: '2024-09-14',
      type: 'expense',
      status: 'completed',
      account: 'Credit Card',
      tags: ['groceries', 'food']
    },
    {
      id: '4',
      description: 'Investment Contribution',
      amount: -1000.00,
      category: 'Investment',
      subcategory: 'Retirement',
      date: '2024-09-15',
      type: 'expense',
      status: 'completed',
      account: '401k',
      tags: ['investment', 'retirement', 'monthly']
    }
  ])

  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      category: 'Housing',
      budgeted: 2500.00,
      spent: 2200.00,
      remaining: 300.00,
      period: 'monthly',
      alertThreshold: 90
    },
    {
      id: '2',
      category: 'Food',
      budgeted: 600.00,
      spent: 456.78,
      remaining: 143.22,
      period: 'monthly',
      alertThreshold: 80
    },
    {
      id: '3',
      category: 'Transportation',
      budgeted: 400.00,
      spent: 234.50,
      remaining: 165.50,
      period: 'monthly',
      alertThreshold: 85
    },
    {
      id: '4',
      category: 'Entertainment',
      budgeted: 300.00,
      spent: 187.25,
      remaining: 112.75,
      period: 'monthly',
      alertThreshold: 75
    }
  ])

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 25000.00,
      currentAmount: 18750.00,
      targetDate: '2024-12-31',
      category: 'savings',
      priority: 'high',
      description: '6 months of expenses for financial security'
    },
    {
      id: '2',
      name: 'Vacation to Europe',
      targetAmount: 5000.00,
      currentAmount: 2100.00,
      targetDate: '2025-06-01',
      category: 'purchase',
      priority: 'medium',
      description: 'Dream vacation to explore European cities'
    },
    {
      id: '3',
      name: 'Pay off Credit Card',
      targetAmount: 3500.00,
      currentAmount: 1200.00,
      targetDate: '2024-11-30',
      category: 'debt',
      priority: 'high',
      description: 'Eliminate high-interest credit card debt'
    }
  ])

  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')

  // Calculate overview metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0))

  const netIncome = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
      return acc
    }, {} as Record<string, number>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Personal Finance</h1>
          <p className="text-slate-400">Track, budget, and achieve your financial goals</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => setShowAddTransaction(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-700/50 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'transactions', label: 'Transactions', icon: CreditCard },
          { id: 'budgets', label: 'Budgets', icon: PieChart },
          { id: 'goals', label: 'Goals', icon: Target }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-emerald-400 text-sm font-medium">+12.5%</div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Income</p>
                <p className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div className="text-red-400 text-sm font-medium">+8.2%</div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netIncome >= 0 ? '+' : ''}{((netIncome / totalIncome) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Net Income</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${Math.abs(netIncome).toLocaleString()}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Improve'}
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Savings Rate</p>
                <p className="text-2xl font-bold text-white">{savingsRate.toFixed(1)}%</p>
              </div>
            </motion.div>
          </div>

          {/* Expense Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <PieChart className="w-5 h-5 text-emerald-400 mr-2" />
              Expense Breakdown
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount], index) => {
                  const percentage = (amount / totalExpenses) * 100
                  const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Wallet
                  const colorClass = categoryColors[category as keyof typeof categoryColors] || 'from-slate-500 to-slate-600'
                  
                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${colorClass} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${amount.toLocaleString()}</p>
                          <p className="text-slate-400 text-sm">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium mb-2">{category}</p>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${colorClass} h-2 rounded-full transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <CreditCard className="w-5 h-5 text-emerald-400 mr-2" />
                Recent Transactions
              </h2>
              <motion.button
                onClick={() => setActiveTab('transactions')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View All
              </motion.button>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction, index) => {
                const IconComponent = categoryIcons[transaction.category as keyof typeof categoryIcons] || Wallet
                
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl hover:bg-slate-700/30 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'income' ? 
                          <ArrowUpRight className="w-5 h-5" /> : 
                          <ArrowDownRight className="w-5 h-5" />
                        }
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{transaction.description}</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{transaction.account}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-1 text-xs">
                        {transaction.status === 'completed' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        {transaction.status === 'pending' && <Clock className="w-3 h-3 text-yellow-400" />}
                        <span className="text-slate-400 capitalize">{transaction.status}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Budget Management */}
      {activeTab === 'budgets' && (
        <BudgetManager />
      )}

      {/* Goal Tracking */}
      {activeTab === 'goals' && (
        <GoalTracker />
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Transaction Management</h3>
          <p className="text-slate-400 mb-4">Advanced transaction features coming soon</p>
          <p className="text-sm text-slate-500">This section will include detailed transaction management, analytics, and automation features.</p>
        </div>
      )}
    </div>
  )
}

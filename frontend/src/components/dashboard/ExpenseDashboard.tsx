'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Budget } from '@/lib/supabase'
import { 
  ArrowLeft, 
  TrendingDown, 
  TrendingUp, 
  Calendar,
  PieChart,
  BarChart3,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Filter,
  Download
} from 'lucide-react'
import { useFinancial } from '@/contexts/FinancialContext'
import { 
  PieChart as RechartsPieChart, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  Pie
} from 'recharts'

interface ExpenseDashboardProps {
  onBack: () => void
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#84CC16']

const ExpenseDashboard: React.FC<ExpenseDashboardProps> = ({ onBack }) => {
  const { transactions, financialData, budgets } = useFinancial()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter expense transactions
  const expenseTransactions = transactions.filter((t: any) => t.type === 'expense')

  // Calculate category-wise expenses
  const categoryExpenses = useMemo(() => {
    const categoryMap = new Map<string, number>()
    expenseTransactions.forEach((transaction: any) => {
      const current = categoryMap.get(transaction.category) || 0
      categoryMap.set(transaction.category, current + transaction.amount)
    })
    
    const monthlyExpenses = financialData?.monthlyExpenses || 1
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.min((amount / monthlyExpenses) * 100, 100).toFixed(1)
    })).sort((a, b) => b.amount - a.amount)
  }, [expenseTransactions, financialData])

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const monthMap = new Map<string, number>()
    expenseTransactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const current = monthMap.get(month) || 0
      monthMap.set(month, current + transaction.amount)
    })
    
    return Array.from(monthMap.entries()).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }, [expenseTransactions])

  // AI Insights
  const aiInsights = useMemo(() => {
    const insights = []
    const totalExpenses = financialData?.monthlyExpenses || 0
    
    // Top spending category
    if (categoryExpenses.length > 0) {
      const topCategory = categoryExpenses[0]
      insights.push({
        type: 'warning',
        title: 'Highest Spending Category',
        message: `${topCategory.category} accounts for ${topCategory.percentage}% of your expenses (₹${topCategory.amount.toLocaleString()})`
      })
    }

    // Budget analysis
    const budgetProgress = budgets.map((budget: Budget) => ({
      ...budget,
      progress: Math.min(((budget.spent_amount || 0) / (budget.limit_amount || 1)) * 100, 100),
      remaining: (budget.limit_amount || 0) - (budget.spent_amount || 0)
    })).map((budget) => {
      const spentPercentage = budget.progress
      if (spentPercentage > 90) {
        insights.push({
          type: 'alert',
          title: 'Budget Alert',
          message: `You've spent ${spentPercentage.toFixed(0)}% of your ${budget.name} budget`
        })
      } else if (spentPercentage < 50) {
        insights.push({
          type: 'success',
          title: 'Budget on Track',
          message: `Great job! You're only at ${spentPercentage.toFixed(0)}% of your ${budget.name} budget`
        })
      }
    })

    // Spending trend
    if (monthlyTrends.length >= 2) {
      const lastMonth = monthlyTrends[monthlyTrends.length - 1]
      const previousMonth = monthlyTrends[monthlyTrends.length - 2]
      const change = ((lastMonth.amount - previousMonth.amount) / previousMonth.amount) * 100
      
      if (change > 10) {
        insights.push({
          type: 'warning',
          title: 'Spending Increase',
          message: `Your expenses increased by ${change.toFixed(1)}% compared to last month`
        })
      } else if (change < -10) {
        insights.push({
          type: 'success',
          title: 'Spending Reduction',
          message: `Great! You reduced expenses by ${Math.abs(change).toFixed(1)}% compared to last month`
        })
      }
    }

    return insights
  }, [categoryExpenses, budgets, monthlyTrends, financialData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Expense Analytics
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Detailed insights into your spending patterns
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{financialData?.monthlyExpenses?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Transactions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {expenseTransactions.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Categories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {categoryExpenses.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <PieChart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg per Day</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{Math.round((financialData?.monthlyExpenses || 0) / 30).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Expense by Category
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryExpenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Monthly Trends */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              Monthly Spending Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8B5CF6" 
                    fill="url(#colorGradient)" 
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              AI Insights & Recommendations
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  insight.type === 'alert' 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                    : insight.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'alert' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                  ) : insight.type === 'warning' ? (
                    <Target className="w-5 h-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Category Breakdown
          </h3>
          
          <div className="space-y-4">
            {categoryExpenses.map((category, index) => (
              <div
                key={category.category}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={() => setSelectedCategory(category.category)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {category.category}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {category.percentage}% of total expenses
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    ₹{category.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {expenseTransactions.filter(t => t.category === category.category).length} transactions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ExpenseDashboard

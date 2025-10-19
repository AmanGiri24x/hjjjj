'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign, TrendingUp, TrendingDown, Target, PieChart, BarChart3, Activity, Bell, Settings, Plus, Eye, EyeOff, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Zap, MessageCircle, ChevronRight, User
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useFinancial } from '@/contexts/FinancialContext'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement,
} from 'chart.js'
import WorkingFinnyChat from '@/components/ai/WorkingFinnyChat'
import QuickTransactionForm from '@/components/transactions/QuickTransactionForm'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement)

interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'achievement'
  title: string
  description: string
  confidence: number
  actionable: boolean
  priority: 'high' | 'medium' | 'low'
  category: string
}

export default function EnhancedPersonalizedDashboard() {
  const { user } = useAuthStore()
  const { financialData, transactions, goals, isLoading } = useFinancial()
  const [showValues, setShowValues] = useState(true)
  const [showFinnyChat, setShowFinnyChat] = useState(false)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [financialHealthScore, setFinancialHealthScore] = useState(0)
  const [showTransactionForm, setShowTransactionForm] = useState(false)

  useEffect(() => {
    generateAIInsights()
    if (financialData && financialData.monthlyIncome > 0) {
      calculateFinancialHealthScore()
    }
  }, [financialData, transactions, goals])

  const generateAIInsights = () => {
    const insights: AIInsight[] = []
    
    // Only generate insights if user has provided financial data
    if (!financialData || financialData.monthlyIncome === 0) {
      insights.push({
        id: 'welcome', type: 'recommendation', title: 'Welcome to DhanAi!',
        description: 'Complete your financial profile to get personalized AI insights and recommendations.',
        confidence: 100, actionable: true, priority: 'high', category: 'onboarding'
      })
      setAiInsights(insights)
      return
    }
    
    const savingsRate = (financialData.savings / financialData.monthlyIncome) * 100
    
    // Only show insights if we have meaningful data
    if (financialData.monthlyIncome > 0) {
      if (savingsRate < 20) {
        insights.push({
          id: '1', type: 'recommendation', title: 'Increase Your Savings Rate',
          description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Consider aiming for 20-30% to build wealth faster.`,
          confidence: 85, actionable: true, priority: 'high', category: 'savings'
        })
      }

      if (financialData.monthlyExpenses > financialData.monthlyIncome * 0.8) {
        insights.push({
          id: '2', type: 'alert', title: 'High Expense Ratio',
          description: 'Your expenses are consuming 80%+ of your income. Review your budget to identify areas for optimization.',
          confidence: 90, actionable: true, priority: 'high', category: 'budgeting'
        })
      }

      if (financialData.investments < financialData.netWorth * 0.3 && financialData.netWorth > 0) {
        insights.push({
          id: '3', type: 'opportunity', title: 'Investment Opportunity',
          description: 'Consider increasing your investment allocation to grow wealth through market returns.',
          confidence: 75, actionable: true, priority: 'medium', category: 'investment'
        })
      }
    }

    // Only show goal insights if goals exist and have progress
    goals.forEach(goal => {
      if (goal.current_amount > 0) {
        const progressPercentage = (goal.current_amount / goal.target_amount) * 100
        if (progressPercentage > 80) {
          insights.push({
            id: `goal-${goal.id}`, type: 'achievement', title: `Almost There: ${goal.name}`,
            description: `You're ${progressPercentage.toFixed(1)}% towards your ${goal.name} goal! Keep it up!`,
            confidence: 100, actionable: false, priority: 'medium', category: 'goals'
          })
        }
      }
    })

    // If no meaningful insights, show getting started message
    if (insights.length === 0) {
      insights.push({
        id: 'getting-started', type: 'recommendation', title: 'Start Your Financial Journey',
        description: 'Add your first transaction or update your financial information to get personalized insights.',
        confidence: 100, actionable: true, priority: 'medium', category: 'getting-started'
      })
    }

    setAiInsights(insights)
  }

  const calculateFinancialHealthScore = () => {
    if (!financialData) return
    let score = 0
    
    const emergencyFundMonths = financialData.savings / financialData.monthlyExpenses
    if (emergencyFundMonths >= 6) score += 30
    else if (emergencyFundMonths >= 3) score += 20
    else if (emergencyFundMonths >= 1) score += 10

    const savingsRate = (financialData.savings / financialData.monthlyIncome) * 100
    if (savingsRate >= 30) score += 25
    else if (savingsRate >= 20) score += 20
    else if (savingsRate >= 10) score += 15
    else if (savingsRate >= 5) score += 10

    if (financialData.investments > 0) {
      const investmentRatio = financialData.investments / financialData.netWorth
      if (investmentRatio >= 0.3) score += 25
      else if (investmentRatio >= 0.2) score += 20
      else if (investmentRatio >= 0.1) score += 15
      else score += 10
    }

    if (financialData.debt === 0) score += 20
    else {
      const debtToIncomeRatio = financialData.debt / (financialData.monthlyIncome * 12)
      if (debtToIncomeRatio <= 0.1) score += 15
      else if (debtToIncomeRatio <= 0.3) score += 10
      else if (debtToIncomeRatio <= 0.5) score += 5
    }

    setFinancialHealthScore(Math.min(score, 100))
  }

  const getMetrics = () => {
    if (!financialData) return []
    return [
      { label: 'Net Worth', value: financialData.netWorth, change: 8.2, changeType: 'increase', icon: DollarSign, color: 'emerald' },
      { label: 'Monthly Income', value: financialData.monthlyIncome, change: 5.1, changeType: 'increase', icon: TrendingUp, color: 'blue' },
      { label: 'Monthly Expenses', value: financialData.monthlyExpenses, change: -2.3, changeType: 'decrease', icon: CreditCard, color: 'orange' },
      { label: 'Savings', value: financialData.savings, change: 12.8, changeType: 'increase', icon: Wallet, color: 'purple' },
      { label: 'Investments', value: financialData.investments, change: 15.4, changeType: 'increase', icon: BarChart3, color: 'cyan' },
      { label: 'Goals Progress', value: goals.length > 0 ? (goals.reduce((sum, goal) => sum + (goal.current_amount / goal.target_amount), 0) / goals.length) * 100 : 0, change: 8.7, changeType: 'increase', icon: Target, color: 'pink' }
    ]
  }

  // Generate chart data based on actual user data
  const spendingChartData = {
    labels: transactions.length > 0 ? 
      [...new Set(transactions.map(t => t.category))].slice(0, 6) :
      ['No spending data yet'],
    datasets: [{
      data: transactions.length > 0 ? 
        [...new Set(transactions.map(t => t.category))].slice(0, 6).map(category => 
          transactions.filter(t => t.category === category && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0)
        ) : [1],
      backgroundColor: transactions.length > 0 ? 
        ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'] :
        ['#E5E7EB'],
      borderWidth: 0, hoverOffset: 4,
    }],
  }

  const incomeVsExpenseData = {
    labels: financialData ? ['This Month'] : ['No Data'],
    datasets: [
      { 
        label: 'Income', 
        data: financialData ? [financialData.monthlyIncome] : [0], 
        borderColor: '#10B981', 
        backgroundColor: 'rgba(16, 185, 129, 0.1)', 
        tension: 0.4, 
        fill: true 
      },
      { 
        label: 'Expenses', 
        data: financialData ? [financialData.monthlyExpenses] : [0], 
        borderColor: '#EF4444', 
        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
        tension: 0.4, 
        fill: true 
      }
    ],
  }

  const formatCurrency = (amount: number) => {
    if (!showValues) return '••••••'
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your financial insights...</p>
        </div>
      </div>
    )
  }

  // Show empty state if no financial data
  if (!financialData || financialData.monthlyIncome === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome to DhanAi, {user?.first_name || 'User'}!
                </h1>
                <p className="text-gray-600 mt-1">Let's get started with your financial journey</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFinnyChat(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask Finny</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Financial Setup</h2>
            <p className="text-gray-600 text-lg mb-8">
              Add your financial information to unlock personalized insights, AI recommendations, and track your progress toward your goals.
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => window.location.href = '/onboarding'}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Profile</h3>
              <p className="text-gray-600 text-sm">Add your income, expenses, and financial goals to get started.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => setShowTransactionForm(true)}
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Transactions</h3>
              <p className="text-gray-600 text-sm">Track your spending and income to see where your money goes.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => setShowFinnyChat(true)}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat with Finny</h3>
              <p className="text-gray-600 text-sm">Get AI-powered financial advice and personalized recommendations.</p>
            </motion.div>
          </div>

          {/* Benefits Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">What you'll get with DhanAi:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Smart Analytics</h4>
                <p className="text-sm text-gray-600">Interactive charts and spending insights</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Goal Tracking</h4>
                <p className="text-sm text-gray-600">Set and achieve your financial goals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">AI Insights</h4>
                <p className="text-sm text-gray-600">Personalized recommendations from Finny</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Health Score</h4>
                <p className="text-sm text-gray-600">Track your financial wellness</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showFinnyChat && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFinnyChat(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <WorkingFinnyChat onClose={() => setShowFinnyChat(false)} />
              </motion.div>
            </motion.div>
          )}
          
          {showTransactionForm && (
            <QuickTransactionForm 
              onClose={() => setShowTransactionForm(false)}
              onSuccess={() => {
                // Refresh insights after adding transaction
                setTimeout(() => {
                  generateAIInsights()
                  if (financialData && financialData.monthlyIncome > 0) {
                    calculateFinancialHealthScore()
                  }
                }, 100)
              }}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {user?.first_name || 'User'}
              </h1>
              <p className="text-gray-600 mt-1">Your personalized financial insights</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowValues(!showValues)} className="p-2 rounded-lg bg-white shadow-sm border hover:shadow-md transition-all">
                {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              
              <button onClick={() => setShowFinnyChat(true)} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
                <MessageCircle className="w-4 h-4" />
                <span>Ask Finny</span>
              </button>

              <button className="p-2 rounded-lg bg-white shadow-sm border hover:shadow-md transition-all">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Financial Health Score</h2>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold">{financialHealthScore}/100</div>
                <div className="text-sm opacity-90">
                  {financialHealthScore >= 80 ? 'Excellent' : financialHealthScore >= 60 ? 'Good' : financialHealthScore >= 40 ? 'Fair' : 'Needs Improvement'}
                </div>
              </div>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {getMetrics().map((metric, index) => (
            <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${metric.color}-100`}>
                  {React.createElement(metric.icon, { className: `w-6 h-6 text-${metric.color}-600` })}
                </div>
                <div className={`flex items-center space-x-1 text-sm ${metric.changeType === 'increase' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {metric.changeType === 'increase' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.label}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.label.includes('Progress') ? `${metric.value.toFixed(1)}%` : formatCurrency(metric.value)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Spending Categories</h3>
              <PieChart className="w-5 h-5 text-gray-600" />
            </div>
            <div className="h-64">
              <Doughnut data={spendingChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { size: 12 } } } } }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
              <BarChart3 className="w-5 h-5 text-gray-600" />
            </div>
            <div className="h-64">
              <Line data={incomeVsExpenseData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: false, ticks: { callback: function(value) { return '₹' + (Number(value) / 1000) + 'K' } } } } }} />
            </div>
          </motion.div>
        </div>

        {/* AI Insights Panel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Finny's AI Insights</h3>
                <p className="text-sm text-gray-600">Personalized recommendations for you</p>
              </div>
            </div>
            <button onClick={() => setShowFinnyChat(true)} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {aiInsights.slice(0, 3).map((insight, index) => (
              <motion.div key={insight.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }} className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  insight.type === 'recommendation' ? 'bg-blue-100 text-blue-600' :
                  insight.type === 'alert' ? 'bg-red-100 text-red-600' :
                  insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {insight.type === 'recommendation' ? <Target className="w-4 h-4" /> :
                   insight.type === 'alert' ? <Bell className="w-4 h-4" /> :
                   insight.type === 'opportunity' ? <TrendingUp className="w-4 h-4" /> :
                   <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Confidence: {insight.confidence}%</span>
                    {insight.actionable && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Actionable</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Goals Progress */}
        {goals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Goal Progress</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.slice(0, 3).map((goal, index) => {
                const progress = (goal.current_amount / goal.target_amount) * 100
                return (
                  <motion.div key={goal.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 + index * 0.1 }} className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <span className="text-xs text-gray-500">{goal.category}</span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{formatCurrency(goal.current_amount)}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(goal.target_amount)}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Finny Chat Modal */}
      <AnimatePresence>
        {showFinnyChat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowFinnyChat(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <WorkingFinnyChat onClose={() => setShowFinnyChat(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

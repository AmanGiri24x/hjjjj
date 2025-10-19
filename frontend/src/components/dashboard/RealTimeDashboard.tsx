'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CreditCard,
  Target,
  Plus,
  Minus,
  Calculator,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import realFinancialService from '@/lib/services/realFinancialService'

interface Transaction {
  id: string
  amount: number
  description: string
  category: string
  type: 'income' | 'expense'
  date: string
  merchantName?: string
}

interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  topCategories: Array<{
    category: string
    amount: number
    percentage: number
  }>
  recentTransactions: Transaction[]
  monthlyTrend: Array<{
    month: string
    income: number
    expenses: number
    savings: number
  }>
}

interface AIAnalysis {
  spendingInsights: string[]
  recommendations: string[]
  riskAssessment: string
  budgetSuggestions: Array<{
    category: string
    suggestedAmount: number
    reason: string
  }>
  investmentAdvice: string[]
  savingsGoalProgress: {
    currentSavings: number
    monthlyTarget: number
    projectedGoalDate: string
  }
}

export default function RealTimeDashboard() {
  const { user } = useAuthStore()
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense'
  })

  // Load real financial data
  useEffect(() => {
    if (user) {
      loadFinancialData()
    }
  }, [user])

  const loadFinancialData = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      // Use real financial service
      const summary = await realFinancialService.getFinancialSummary()
      setFinancialData(summary)

      // Get AI analysis of real data
      const analysis = await realFinancialService.getAIAnalysis()
      setAiAnalysis(analysis)
      
    } catch (error) {
      console.error('Error loading financial data:', error)
      // Test connection if there's an error
      try {
        const connectionTest = await realFinancialService.testConnection()
        console.log('Connection test:', connectionTest)
      } catch (testError) {
        console.error('Connection test failed:', testError)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getAuthToken = async () => {
    // Get token from your auth store/service
    return localStorage.getItem('auth_token') || ''
  }

  const addTransaction = async () => {
    if (!formData.amount || !formData.description) return
    
    try {
      // Use real financial service to add transaction
      await realFinancialService.addTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category || 'Other',
        type: formData.type,
        date: new Date()
      })

      // Refresh data to show updated values
      await loadFinancialData()
      setActiveModal(null)
      setFormData({ amount: '', description: '', category: '', type: 'expense' })
      
    } catch (error) {
      console.error('Error adding transaction:', error)
      alert('Failed to add transaction. Please check your connection.')
    }
  }

  const addQuickExpense = async (type: string, amount: number) => {
    try {
      // Use real financial service for quick expenses
      await realFinancialService.addQuickExpense(type, amount)
      await loadFinancialData()
    } catch (error) {
      console.error('Error adding quick expense:', error)
      alert('Failed to add expense. Please check your connection.')
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadFinancialData()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Loading Your Financial Data</h2>
          <p className="text-gray-400">Analyzing your real transactions...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Real-Time Financial Dashboard
          </h1>
          <p className="text-gray-400">
            Live tracking of your actual financial data
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-2 rounded-lg bg-slate-800 text-gray-300 hover:text-white transition-colors"
          >
            {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Income */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-400 text-sm font-medium">Total Income</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {showValues ? formatCurrency(financialData?.totalIncome || 0) : '₹ ****'}
          </div>
          <div className="text-sm text-gray-400">
            Monthly: {showValues ? formatCurrency(financialData?.monthlyIncome || 0) : '₹ ****'}
          </div>
        </motion.div>

        {/* Total Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <span className="text-red-400 text-sm font-medium">Total Expenses</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {showValues ? formatCurrency(financialData?.totalExpenses || 0) : '₹ ****'}
          </div>
          <div className="text-sm text-gray-400">
            Monthly: {showValues ? formatCurrency(financialData?.monthlyExpenses || 0) : '₹ ****'}
          </div>
        </motion.div>

        {/* Net Savings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <span className="text-blue-400 text-sm font-medium">Net Savings</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {showValues ? formatCurrency(financialData?.netSavings || 0) : '₹ ****'}
          </div>
          <div className={`text-sm ${(financialData?.netSavings || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(financialData?.netSavings || 0) >= 0 ? 'Positive savings' : 'Deficit spending'}
          </div>
        </motion.div>

        {/* Savings Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-purple-400 text-sm font-medium">Savings Rate</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {showValues ? 
              `${((financialData?.netSavings || 0) / (financialData?.totalIncome || 1) * 100).toFixed(1)}%` : 
              '**%'
            }
          </div>
          <div className="text-sm text-gray-400">
            Target: 20%
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.button
          onClick={() => setActiveModal('add-income')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all"
        >
          <Plus className="w-6 h-6 mb-2 mx-auto" />
          Add Income
        </motion.button>

        <motion.button
          onClick={() => setActiveModal('add-expense')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all"
        >
          <Minus className="w-6 h-6 mb-2 mx-auto" />
          Add Expense
        </motion.button>

        <motion.button
          onClick={() => setActiveModal('quick-expense')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all"
        >
          <Calculator className="w-6 h-6 mb-2 mx-auto" />
          Quick Expense
        </motion.button>

        <motion.button
          onClick={() => setActiveModal('ai-analysis')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all"
        >
          <Brain className="w-6 h-6 mb-2 mx-auto" />
          AI Analysis
        </motion.button>
      </div>

      {/* Top Spending Categories */}
      {financialData?.topCategories && financialData.topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Top Spending Categories
          </h3>
          <div className="space-y-4">
            {financialData.topCategories.slice(0, 5).map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                    index === 0 ? 'from-red-500 to-pink-500' :
                    index === 1 ? 'from-orange-500 to-amber-500' :
                    index === 2 ? 'from-blue-500 to-cyan-500' :
                    index === 3 ? 'from-green-500 to-emerald-500' :
                    'from-purple-500 to-violet-500'
                  }`} />
                  <span className="text-white font-medium">{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">
                    {showValues ? formatCurrency(category.amount) : '₹ ****'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      {financialData?.recentTransactions && financialData.recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {financialData.recentTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {transaction.type === 'income' ? 
                      <TrendingUp className="w-5 h-5 text-white" /> : 
                      <TrendingDown className="w-5 h-5 text-white" />
                    }
                  </div>
                  <div>
                    <div className="text-white font-medium">{transaction.description}</div>
                    <div className="text-gray-400 text-sm">{transaction.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {showValues ? formatCurrency(transaction.amount) : '₹ ****'}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Insights */}
      {aiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            AI Financial Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-3">Spending Insights</h4>
              <div className="space-y-2">
                {aiAnalysis.spendingInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {aiAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Risk Assessment</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                aiAnalysis.riskAssessment.toLowerCase().includes('low') ? 'bg-green-500/20 text-green-400' :
                aiAnalysis.riskAssessment.toLowerCase().includes('medium') ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {aiAnalysis.riskAssessment}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
            >
              {activeModal === 'add-income' && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Add Income</h3>
                  <div className="space-y-4">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select category</option>
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Investment">Investment</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setFormData({...formData, type: 'income'})
                          addTransaction()
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add Income
                      </button>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'add-expense' && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Add Expense</h3>
                  <div className="space-y-4">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    />
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select category</option>
                      <option value="Food">Food & Dining</option>
                      <option value="Housing">Housing</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setFormData({...formData, type: 'expense'})
                          addTransaction()
                        }}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Add Expense
                      </button>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'quick-expense' && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Quick Expense</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: 'rent', label: 'Rent', amount: 25000 },
                      { type: 'groceries', label: 'Groceries', amount: 3000 },
                      { type: 'fuel', label: 'Fuel', amount: 2000 },
                      { type: 'electricity', label: 'Electricity', amount: 1500 },
                      { type: 'internet', label: 'Internet', amount: 1000 },
                      { type: 'dining', label: 'Dining', amount: 800 }
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => {
                          addQuickExpense(item.type, item.amount)
                          setActiveModal(null)
                        }}
                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
                      >
                        <div className="font-medium">{item.label}</div>
                        <div className="text-sm text-gray-400">₹{item.amount}</div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full mt-4 bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

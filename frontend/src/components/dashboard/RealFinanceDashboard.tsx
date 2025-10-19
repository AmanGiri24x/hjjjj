'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CreditCard,
  Target,
  Plus,
  Eye,
  EyeOff,
  Calculator,
  Loader2,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
  Zap,
  X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

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
  recentTransactions: any[]
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

export default function RealFinanceDashboard() {
  const { user } = useAuthStore()
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    category: '',
    type: 'expense' as 'income' | 'expense'
  })

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      
      // Load financial summary
      const summaryResponse = await fetch('/api/financial/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json()
        setSummary(summaryData)
      }
      
    } catch (error) {
      console.error('Failed to load financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAIAnalysis = async () => {
    try {
      const response = await fetch('/api/financial/ai-analysis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const analysis = await response.json()
        setAiAnalysis(analysis)
      }
    } catch (error) {
      console.error('Failed to load AI analysis:', error)
    }
  }

  const addTransaction = async () => {
    try {
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(newTransaction.amount),
          description: newTransaction.description,
          category: newTransaction.category,
          type: newTransaction.type
        })
      })

      if (response.ok) {
        setNewTransaction({ amount: '', description: '', category: '', type: 'expense' })
        setShowAddTransaction(false)
        loadFinancialData() // Reload data
      }
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  const handleStatClick = async (statType: string) => {
    setSelectedStat(statType)
    if (!aiAnalysis) {
      await loadAIAnalysis()
    }
  }

  const quickExpenseButtons = [
    { type: 'rent', label: 'Rent', icon: '🏠', color: 'from-blue-500 to-blue-600' },
    { type: 'groceries', label: 'Groceries', icon: '🛒', color: 'from-green-500 to-green-600' },
    { type: 'fuel', label: 'Fuel', icon: '⛽', color: 'from-orange-500 to-orange-600' },
    { type: 'dining', label: 'Dining', icon: '🍽️', color: 'from-purple-500 to-purple-600' },
  ]

  const addQuickExpense = async (type: string, amount: number) => {
    try {
      const response = await fetch('/api/financial/quick-expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, amount })
      })

      if (response.ok) {
        loadFinancialData()
      }
    } catch (error) {
      console.error('Failed to add quick expense:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Your Financial Dashboard
              </h1>
              <p className="text-slate-400">Real-time insights powered by AI</p>
            </div>
            <div className="flex space-x-4">
              <motion.button
                onClick={() => setShowBalance(!showBalance)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/50 text-slate-300 hover:text-white transition-all"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </motion.button>
              <motion.button
                onClick={() => setShowAddTransaction(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-xl text-white font-medium transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Transaction
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <motion.div
            onClick={() => handleStatClick('income')}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Income</h3>
            <p className="text-2xl font-bold text-white">
              {showBalance ? `₹${summary?.totalIncome?.toLocaleString() || '0'}` : '₹••••••'}
            </p>
            <p className="text-emerald-400 text-sm mt-2">
              Monthly: ₹{showBalance ? summary?.monthlyIncome?.toLocaleString() || '0' : '••••'}
            </p>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            onClick={() => handleStatClick('expenses')}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total Expenses</h3>
            <p className="text-2xl font-bold text-white">
              {showBalance ? `₹${summary?.totalExpenses?.toLocaleString() || '0'}` : '₹••••••'}
            </p>
            <p className="text-red-400 text-sm mt-2">
              Monthly: ₹{showBalance ? summary?.monthlyExpenses?.toLocaleString() || '0' : '••••'}
            </p>
          </motion.div>

          {/* Net Savings */}
          <motion.div
            onClick={() => handleStatClick('savings')}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white" />
              </div>
              <Calculator className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Net Savings</h3>
            <p className="text-2xl font-bold text-white">
              {showBalance ? `₹${summary?.netSavings?.toLocaleString() || '0'}` : '₹••••••'}
            </p>
            <p className={`text-sm mt-2 ${(summary?.netSavings || 0) >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {(summary?.netSavings || 0) >= 0 ? 'Positive' : 'Negative'} Balance
            </p>
          </motion.div>

          {/* Savings Rate */}
          <motion.div
            onClick={() => handleStatClick('rate')}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <PieChart className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Savings Rate</h3>
            <p className="text-2xl font-bold text-white">
              {showBalance ? 
                `${summary?.totalIncome ? ((summary.netSavings / summary.totalIncome) * 100).toFixed(1) : '0'}%` 
                : '••%'
              }
            </p>
            <p className="text-purple-400 text-sm mt-2">
              Target: 20%
            </p>
          </motion.div>
        </div>

        {/* Quick Add Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">Quick Add Expenses</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickExpenseButtons.map((button) => (
              <motion.button
                key={button.type}
                onClick={() => {
                  const amount = prompt(`Enter amount for ${button.label}:`);
                  if (amount && !isNaN(parseFloat(amount))) {
                    addQuickExpense(button.type, parseFloat(amount));
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-4 bg-gradient-to-r ${button.color} rounded-xl text-white font-medium transition-all hover:shadow-lg`}
              >
                <div className="text-2xl mb-2">{button.icon}</div>
                <div className="text-sm">{button.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* AI Analysis Panel */}
        {selectedStat && aiAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Brain className="w-6 h-6 text-emerald-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">AI Financial Analysis</h3>
                  <Zap className="w-5 h-5 text-yellow-400 ml-2" />
                </div>
                <button
                  onClick={() => setSelectedStat(null)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-emerald-400 font-semibold mb-3">Key Insights</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.spendingInsights.map((insight, index) => (
                      <li key={index} className="text-slate-300 text-sm flex items-start">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-blue-400 font-semibold mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-slate-300 text-sm flex items-start">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">Risk Assessment</h4>
                <p className="text-slate-300 text-sm">{aiAnalysis.riskAssessment}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Add Transaction</h3>
                <button
                  onClick={() => setShowAddTransaction(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Type</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as 'income' | 'expense'})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Amount (₹)</label>
                  <input
                    type="number"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Description</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="Rent payment"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Category</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="">Select category</option>
                    <option value="Housing">Housing</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Salary">Salary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddTransaction(false)}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTransaction}
                    disabled={!newTransaction.amount || !newTransaction.description || !newTransaction.category}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg transition-all"
                  >
                    Add Transaction
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

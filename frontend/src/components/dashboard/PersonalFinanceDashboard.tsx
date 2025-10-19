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
  BookOpen,
  Users,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sun,
  Moon,
  Plus,
  Eye,
  EyeOff,
  Minus,
  Calculator,
  Loader2
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useFinancial } from '@/contexts/FinancialContext'
import EmptyState from './EmptyState'
import ExpenseDashboard from './ExpenseDashboard'

interface FinancialData {
  income: number
  expenses: number
  savings: number
  debt: number
  savingsGoal: number
  debtGoal: number
  portfolioValue: number
  monthlyGrowth: number
}

interface ChartData {
  month: string
  savings: number
  expenses: number
}

export default function PersonalFinanceDashboard() {
  const { theme, setTheme } = useTheme()
  const { 
    financialData, 
    transactions, 
    goals, 
    budgets, 
    isLoading, 
    isNewUser,
    addTransaction,
    addGoal,
    addBudget,
    initializeUserData
  } = useFinancial()

  const [mounted, setMounted] = useState(false)
  const [showValues, setShowValues] = useState(true)
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [showExpenseDashboard, setShowExpenseDashboard] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    goalAmount: '',
    goalName: '',
    budgetCategory: '',
    budgetLimit: ''
  })
  
  const chartData: ChartData[] = [
    { month: 'J', savings: 15000, expenses: 12000 },
    { month: 'F', savings: 18000, expenses: 11000 },
    { month: 'M', savings: 22000, expenses: 13000 },
    { month: 'A', savings: 19000, expenses: 14000 },
    { month: 'M', savings: 25000, expenses: 12000 },
    { month: 'J', savings: 21000, expenses: 15000 },
    { month: 'J', savings: 28000, expenses: 13000 },
    { month: 'A', savings: 24000, expenses: 11000 },
    { month: 'S', savings: 30000, expenses: 12000 }
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (showExpenseDashboard) {
    return <ExpenseDashboard onBack={() => setShowExpenseDashboard(false)} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  if (isNewUser) {
    return <EmptyState onGetStarted={initializeUserData} />
  }

  // Form handlers
  const handleAddIncome = () => {
    if (formData.amount && formData.description) {
      addTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category || 'Other',
        date: new Date().toISOString(),
        type: 'income'
      })
      setActiveModal(null)
      setFormData({ ...formData, amount: '', description: '', category: '' })
    }
  }

  const handleAddExpense = () => {
    if (formData.amount && formData.description) {
      addTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category || 'Other',
        date: new Date().toISOString(),
        type: 'expense'
      })
      setActiveModal(null)
      setFormData({ ...formData, amount: '', description: '', category: '' })
    }
  }

  const handleSetGoal = () => {
    if (formData.goalAmount && formData.goalName) {
      addGoal({
        name: formData.goalName,
        target_amount: parseFloat(formData.goalAmount),
        category: 'savings'
      })
      setActiveModal(null)
      setFormData({ ...formData, goalAmount: '', goalName: '' })
    }
  }

  const handleBudgetPlan = () => {
    if (formData.budgetCategory && formData.budgetLimit) {
      const now = new Date()
      const endDate = new Date()
      endDate.setMonth(now.getMonth() + 1) // 1 month from now
      
      addBudget({
        name: formData.budgetCategory,
        category: formData.budgetCategory.toLowerCase(),
        limit_amount: parseFloat(formData.budgetLimit),
        period: 'monthly',
        start_date: now.toISOString(),
        end_date: endDate.toISOString()
      })
      setActiveModal(null)
      setFormData({ ...formData, budgetCategory: '', budgetLimit: '' })
    }
  }

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const calculatePercentage = (current: number, goal: number) => {
    return Math.round((current / goal) * 100)
  }

  if (!mounted) return null

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Dhan-Ai-lytics
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-6">
            {['About', 'Features', 'Blog', 'Contact'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                {item}
              </a>
            ))}
          </nav>
          
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-yellow-400' : 'bg-gray-200 text-gray-600'} hover:scale-105 transition-all`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setShowValues(!showValues)}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'} hover:scale-105 transition-all`}
          >
            {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-purple-900/30 border-purple-500/20' : 'bg-purple-100 border-purple-200'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Income</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {showValues ? formatCurrency(financialData?.monthlyIncome || 0) : '₹ ****'}
              </h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                30% Of Your Expenses, Looks Good.
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">₹20,000.00</div>
                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                  <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Expenses Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-100 border-gray-200'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total Expense</span>
              </div>
            </div>
            
            <div className="mb-4 cursor-pointer" onClick={() => setShowExpenseDashboard(true)}>
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} hover:text-blue-600 transition-colors`}>
                {showValues ? `₹ -${financialData?.monthlyExpenses?.toFixed(2) || '0'}` : '₹ -****'}
              </h3>
            </div>
          </motion.div>

          {/* Savings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-blue-900/30 border-blue-500/20' : 'bg-blue-100 border-blue-200'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Savings</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {showValues ? formatCurrency(financialData?.savings || 0) : '₹ ****'}
              </h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                75% Of Your Saved, Looks Good.
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">₹1,50,000.00</div>
                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                  <div className="w-6 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Debt Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-red-900/30 border-red-500/20' : 'bg-red-100 border-red-200'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Debt</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {showValues ? formatCurrency(financialData?.debt || 0) : '₹ ****'}
              </h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                75% Of Your Debt, Is Already Paid.
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">₹3,00,000.00</div>
                <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                  <div className="w-16 h-2 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Financial Education */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-pink-900/30 border-pink-500/20' : 'bg-pink-100 border-pink-200'} border backdrop-blur-sm`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Financial Education</span>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} mb-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>Basic of Stock Market</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Learn the fundamentals</div>
            </div>
          </motion.div>

          {/* Goal Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-purple-900/30 border-purple-500/20' : 'bg-purple-100 border-purple-200'} border backdrop-blur-sm`}
          >
            <div className="text-center">
              <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Goal (Financial Independent)
              </div>
              
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeDasharray="72, 100"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>72%</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Portfolio Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-cyan-900/30 border-cyan-500/20' : 'bg-cyan-100 border-cyan-200'} border backdrop-blur-sm`}
          >
            <div className="mb-4">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Portfolio Value</div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                {showValues ? formatCurrency(financialData?.portfolioValue || 0) : '****'}
              </div>
              <div className="flex items-center space-x-1">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-sm font-medium">{financialData?.monthlyGrowth || 0}%</span>
              </div>
            </div>
            
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="3"/>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="25"/>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="3" strokeDasharray="25 75" strokeDashoffset="15"/>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="3" strokeDasharray="20 80" strokeDashoffset="5"/>
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="15 85"/>
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: Plus, label: 'Add Income', color: 'from-green-500 to-emerald-600', action: 'income' },
            { icon: Minus, label: 'Add Expense', color: 'from-red-500 to-pink-600', action: 'expense' },
            { icon: Calculator, label: 'Budget Planner', color: 'from-blue-500 to-cyan-600', action: 'budget' },
            { icon: Target, label: 'Set Goal', color: 'from-purple-500 to-violet-600', action: 'goal' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              onClick={() => setActiveModal(action.action as any)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${action.color} p-6 rounded-2xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all group`}
            >
              <action.icon className="w-8 h-8 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <span className="text-sm">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md"
          >
            {/* Add Income Modal */}
            {activeModal === 'income' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Add Income</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="e.g., Salary, Freelance, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select category</option>
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Investment">Investment</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleAddIncome}
                      className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
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

            {/* Add Expense Modal */}
            {activeModal === 'expense' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Add Expense</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
                      placeholder="e.g., Groceries, Rent, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
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
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleAddExpense}
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

            {/* Budget Planner Modal */}
            {activeModal === 'budget' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Budget Planner</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                    <select
                      value={formData.budgetCategory}
                      onChange={(e) => setFormData({...formData, budgetCategory: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select category</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Housing">Housing</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Monthly Limit</label>
                    <input
                      type="number"
                      value={formData.budgetLimit}
                      onChange={(e) => setFormData({...formData, budgetLimit: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="Enter budget limit"
                    />
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Budget Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Monthly Income:</span>
                        <span>₹{financialData?.monthlyIncome?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Current Expenses:</span>
                        <span>₹{financialData?.monthlyExpenses?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Available:</span>
                        <span>₹{((financialData?.monthlyIncome || 0) - (financialData?.monthlyExpenses || 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleBudgetPlan}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Set Budget
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

            {/* Set Goal Modal */}
            {activeModal === 'goal' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Set Financial Goal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Goal Name</label>
                    <input
                      type="text"
                      value={formData.goalName}
                      onChange={(e) => setFormData({...formData, goalName: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="e.g., Emergency Fund, Vacation, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Target Amount</label>
                    <input
                      type="number"
                      value={formData.goalAmount}
                      onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      placeholder="Enter target amount"
                    />
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Goal Progress</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Current Savings:</span>
                        <span>₹{financialData?.savings?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Monthly Net:</span>
                        <span>₹{((financialData?.monthlyIncome || 0) - (financialData?.monthlyExpenses || 0)).toLocaleString()}</span>
                      </div>
                      {formData.goalAmount && (
                        <div className="flex justify-between text-purple-400 font-medium">
                          <span>Months to Goal:</span>
                          <span>{Math.ceil(parseFloat(formData.goalAmount) / ((financialData?.monthlyIncome || 0) - (financialData?.monthlyExpenses || 0)))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSetGoal}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Set Goal
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
          </motion.div>
        </div>
      )}
    </div>
  )
}

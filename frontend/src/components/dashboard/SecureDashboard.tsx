'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  Activity,
  Shield,
  Bell,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Calculator,
  Receipt,
  Target,
  Zap
} from 'lucide-react'

interface FinancialData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoal: number
  currentSavings: number
  investments: number
  debts: number
  creditScore: number
}

interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: string
  type: 'income' | 'expense'
  status: 'completed' | 'pending'
}

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'investment' | 'credit'
  balance: number
  currency: string
  lastUpdated: string
}

export default function SecureDashboard() {
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalBalance: 127543.50,
    monthlyIncome: 8500.00,
    monthlyExpenses: 5200.00,
    savingsGoal: 50000.00,
    currentSavings: 32750.00,
    investments: 45200.00,
    debts: 12300.00,
    creditScore: 785
  })

  // Modal states
  const [activeModal, setActiveModal] = useState<'income' | 'expense' | 'budget' | 'goal' | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    goalAmount: '',
    goalName: '',
    budgetCategory: '',
    budgetLimit: ''
  })

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'Salary Deposit',
      amount: 8500.00,
      category: 'Income',
      date: '2024-09-15',
      type: 'income',
      status: 'completed'
    },
    {
      id: '2',
      description: 'Grocery Store',
      amount: -156.78,
      category: 'Food',
      date: '2024-09-14',
      type: 'expense',
      status: 'completed'
    },
    {
      id: '3',
      description: 'Investment Return',
      amount: 234.50,
      category: 'Investment',
      date: '2024-09-13',
      type: 'income',
      status: 'completed'
    },
    {
      id: '4',
      description: 'Rent Payment',
      amount: -2200.00,
      category: 'Housing',
      date: '2024-09-12',
      type: 'expense',
      status: 'completed'
    },
    {
      id: '5',
      description: 'Utility Bill',
      amount: -145.30,
      category: 'Utilities',
      date: '2024-09-11',
      type: 'expense',
      status: 'pending'
    }
  ])

  const [accounts] = useState<Account[]>([
    {
      id: '1',
      name: 'Primary Checking',
      type: 'checking',
      balance: 15420.30,
      currency: 'USD',
      lastUpdated: '2024-09-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'High Yield Savings',
      type: 'savings',
      balance: 32750.00,
      currency: 'USD',
      lastUpdated: '2024-09-15T10:30:00Z'
    },
    {
      id: '3',
      name: 'Investment Portfolio',
      type: 'investment',
      balance: 45200.00,
      currency: 'USD',
      lastUpdated: '2024-09-15T10:25:00Z'
    },
    {
      id: '4',
      name: 'Credit Card',
      type: 'credit',
      balance: -2173.20,
      currency: 'USD',
      lastUpdated: '2024-09-15T09:45:00Z'
    }
  ])

  const [showBalances, setShowBalances] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Form handlers
  const handleAddIncome = () => {
    if (formData.amount && formData.description) {
      const amount = parseFloat(formData.amount)
      setFinancialData(prev => ({
        ...prev,
        totalBalance: prev.totalBalance + amount,
        monthlyIncome: prev.monthlyIncome + amount
      }))
      setActiveModal(null)
      setFormData({ ...formData, amount: '', description: '', category: '' })
    }
  }

  const handleAddExpense = () => {
    if (formData.amount && formData.description) {
      const amount = parseFloat(formData.amount)
      setFinancialData(prev => ({
        ...prev,
        totalBalance: prev.totalBalance - amount,
        monthlyExpenses: prev.monthlyExpenses + amount
      }))
      setActiveModal(null)
      setFormData({ ...formData, amount: '', description: '', category: '' })
    }
  }

  const handleSetGoal = () => {
    if (formData.goalAmount && formData.goalName) {
      const amount = parseFloat(formData.goalAmount)
      setFinancialData(prev => ({
        ...prev,
        savingsGoal: amount
      }))
      setActiveModal(null)
      setFormData({ ...formData, goalAmount: '', goalName: '' })
    }
  }

  const handleBudgetPlan = () => {
    // Budget planning logic would go here
    setActiveModal(null)
    setFormData({ ...formData, budgetCategory: '', budgetLimit: '' })
  }

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  const netWorth = financialData.totalBalance - financialData.debts
  const savingsProgress = (financialData.currentSavings / financialData.savingsGoal) * 100
  const monthlyNet = financialData.monthlyIncome - financialData.monthlyExpenses

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Dashboard</h1>
          <p className="text-slate-400">Your complete financial overview</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => setShowBalances(!showBalances)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white hover:bg-slate-700/50 transition-all"
          >
            {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
          </motion.button>
          
          <motion.button
            onClick={refreshData}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Net Worth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5.2%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Net Worth</p>
            <p className="text-2xl font-bold text-white">
              {showBalances ? `$${netWorth.toLocaleString()}` : '••••••'}
            </p>
          </div>
        </motion.div>

        {/* Monthly Cash Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12.3%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Monthly Net</p>
            <p className="text-2xl font-bold text-white">
              {showBalances ? `$${monthlyNet.toLocaleString()}` : '••••••'}
            </p>
          </div>
        </motion.div>

        {/* Savings Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-yellow-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-yellow-400">
              <span className="text-sm font-medium">{savingsProgress.toFixed(1)}%</span>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Savings Goal</p>
            <p className="text-2xl font-bold text-white">
              {showBalances ? `$${financialData.currentSavings.toLocaleString()}` : '••••••'}
            </p>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(savingsProgress, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Credit Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Excellent</span>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Credit Score</p>
            <p className="text-2xl font-bold text-white">
              {showBalances ? financialData.creditScore : '•••'}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Accounts Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <CreditCard className="w-5 h-5 text-emerald-400 mr-2" />
            Accounts Overview
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 hover:bg-slate-700/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  account.type === 'checking' ? 'bg-blue-500/20 text-blue-400' :
                  account.type === 'savings' ? 'bg-green-500/20 text-green-400' :
                  account.type === 'investment' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {account.type === 'checking' && <Wallet className="w-4 h-4" />}
                  {account.type === 'savings' && <PieChart className="w-4 h-4" />}
                  {account.type === 'investment' && <TrendingUp className="w-4 h-4" />}
                  {account.type === 'credit' && <CreditCard className="w-4 h-4" />}
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              
              <div>
                <h3 className="text-white font-medium text-sm mb-1">{account.name}</h3>
                <p className="text-lg font-bold text-white">
                  {showBalances ? 
                    `${account.balance >= 0 ? '' : '-'}$${Math.abs(account.balance).toLocaleString()}` : 
                    '••••••'
                  }
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Updated {new Date(account.lastUpdated).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Receipt className="w-5 h-5 text-emerald-400 mr-2" />
            Recent Transactions
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View All
          </motion.button>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-600/30 rounded-xl hover:bg-slate-700/30 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
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
                    {transaction.status === 'pending' && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {showBalances ? 
                    `${transaction.amount >= 0 ? '+' : ''}$${Math.abs(transaction.amount).toLocaleString()}` : 
                    '••••••'
                  }
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Plus, label: 'Add Income', color: 'from-green-500 to-emerald-600' },
          { icon: Minus, label: 'Add Expense', color: 'from-red-500 to-pink-600' },
          { icon: Calculator, label: 'Budget Planner', color: 'from-blue-500 to-cyan-600' },
          { icon: Target, label: 'Set Goal', color: 'from-purple-500 to-violet-600' }
        ].map((action, index) => {
          const handleClick = () => {
            if (action.label === 'Add Income') setActiveModal('income')
            else if (action.label === 'Add Expense') setActiveModal('expense')
            else if (action.label === 'Budget Planner') setActiveModal('budget')
            else if (action.label === 'Set Goal') setActiveModal('goal')
          }
          
          return (
            <motion.button
              key={action.label}
              onClick={handleClick}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${action.color} p-6 rounded-2xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all group`}
            >
              <action.icon className="w-8 h-8 mb-3 mx-auto group-hover:scale-110 transition-transform" />
              <span className="text-sm">{action.label}</span>
            </motion.button>
          )
        })}
      </motion.div>

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
                      <option value="Food">Food & Dining</option>
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
                        <span>${financialData.monthlyIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Current Expenses:</span>
                        <span>${financialData.monthlyExpenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-medium">
                        <span>Available:</span>
                        <span>${(financialData.monthlyIncome - financialData.monthlyExpenses).toLocaleString()}</span>
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
                        <span>${financialData.currentSavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Monthly Net:</span>
                        <span>${(financialData.monthlyIncome - financialData.monthlyExpenses).toLocaleString()}</span>
                      </div>
                      {formData.goalAmount && (
                        <div className="flex justify-between text-purple-400 font-medium">
                          <span>Months to Goal:</span>
                          <span>{Math.ceil((parseFloat(formData.goalAmount) - financialData.currentSavings) / (financialData.monthlyIncome - financialData.monthlyExpenses))} months</span>
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

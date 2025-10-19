'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react'

interface Budget {
  id: string
  category: string
  budgeted: number
  spent: number
  remaining: number
  period: string
  alertThreshold: number
  isOverBudget: boolean
}

export default function BudgetManager() {
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      category: 'Food & Dining',
      budgeted: 800,
      spent: 650,
      remaining: 150,
      period: 'Monthly',
      alertThreshold: 80,
      isOverBudget: false
    },
    {
      id: '2',
      category: 'Transportation',
      budgeted: 400,
      spent: 420,
      remaining: -20,
      period: 'Monthly',
      alertThreshold: 80,
      isOverBudget: true
    },
    {
      id: '3',
      category: 'Entertainment',
      budgeted: 300,
      spent: 180,
      remaining: 120,
      period: 'Monthly',
      alertThreshold: 80,
      isOverBudget: false
    },
    {
      id: '4',
      category: 'Shopping',
      budgeted: 500,
      spent: 380,
      remaining: 120,
      period: 'Monthly',
      alertThreshold: 80,
      isOverBudget: false
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: '',
    budgeted: '',
    period: 'Monthly',
    alertThreshold: 80
  })

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0)

  const handleCreateBudget = () => {
    if (newBudget.category && newBudget.budgeted) {
      const budget: Budget = {
        id: Date.now().toString(),
        category: newBudget.category,
        budgeted: parseFloat(newBudget.budgeted),
        spent: 0,
        remaining: parseFloat(newBudget.budgeted),
        period: newBudget.period,
        alertThreshold: newBudget.alertThreshold,
        isOverBudget: false
      }
      setBudgets([...budgets, budget])
      setNewBudget({ category: '', budgeted: '', period: 'Monthly', alertThreshold: 80 })
      setShowCreateForm(false)
    }
  }

  const getProgressColor = (budget: Budget) => {
    const percentage = (budget.spent / budget.budgeted) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= budget.alertThreshold) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const getProgressPercentage = (budget: Budget) => {
    return Math.min((budget.spent / budget.budgeted) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Budgeted</p>
              <p className="text-2xl font-bold text-white">${totalBudgeted.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${Math.abs(totalRemaining).toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              totalRemaining >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              <TrendingUp className={`w-6 h-6 ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Budget Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Budget Categories</h3>
        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Budget</span>
        </motion.button>
      </div>

      {/* Create Budget Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Create New Budget</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <input
                type="text"
                value={newBudget.category}
                onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Groceries"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Budget Amount</label>
              <input
                type="number"
                value={newBudget.budgeted}
                onChange={(e) => setNewBudget({ ...newBudget, budgeted: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Period</label>
              <select
                value={newBudget.period}
                onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Alert Threshold (%)</label>
              <input
                type="number"
                value={newBudget.alertThreshold}
                onChange={(e) => setNewBudget({ ...newBudget, alertThreshold: parseInt(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <motion.button
              onClick={handleCreateBudget}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Budget
            </motion.button>
            <motion.button
              onClick={() => setShowCreateForm(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.map((budget, index) => (
          <motion.div
            key={budget.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="text-lg font-semibold text-white">{budget.category}</h4>
                {budget.isOverBudget && (
                  <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Over Budget</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Spent: ${budget.spent.toLocaleString()}</span>
                <span className="text-slate-400">Budget: ${budget.budgeted.toLocaleString()}</span>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercentage(budget)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-3 rounded-full ${getProgressColor(budget)}`}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${
                  budget.remaining >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {budget.remaining >= 0 ? 'Remaining' : 'Over by'}: ${Math.abs(budget.remaining).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">{budget.period}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

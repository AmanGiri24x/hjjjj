'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Target, 
  Calendar, 
  TrendingUp,
  Edit3,
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  category: 'SAVINGS' | 'DEBT' | 'INVESTMENT' | 'PURCHASE'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  progress: number
  monthsRemaining: number
  monthlyTarget: number
  isCompleted: boolean
}

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 6500,
      targetDate: '2024-12-31',
      category: 'SAVINGS',
      priority: 'HIGH',
      progress: 65,
      monthsRemaining: 3,
      monthlyTarget: 1166.67,
      isCompleted: false
    },
    {
      id: '2',
      name: 'New Car',
      targetAmount: 25000,
      currentAmount: 8200,
      targetDate: '2025-06-30',
      category: 'PURCHASE',
      priority: 'MEDIUM',
      progress: 32.8,
      monthsRemaining: 9,
      monthlyTarget: 1866.67,
      isCompleted: false
    },
    {
      id: '3',
      name: 'Investment Portfolio',
      targetAmount: 50000,
      currentAmount: 15600,
      targetDate: '2026-12-31',
      category: 'INVESTMENT',
      priority: 'HIGH',
      progress: 31.2,
      monthsRemaining: 27,
      monthlyTarget: 1274.07,
      isCompleted: false
    },
    {
      id: '4',
      name: 'Vacation Fund',
      targetAmount: 5000,
      currentAmount: 5000,
      targetDate: '2024-07-01',
      category: 'SAVINGS',
      priority: 'LOW',
      progress: 100,
      monthsRemaining: 0,
      monthlyTarget: 0,
      isCompleted: true
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'SAVINGS' as Goal['category'],
    priority: 'MEDIUM' as Goal['priority']
  })

  const activeGoals = goals.filter(goal => !goal.isCompleted)
  const completedGoals = goals.filter(goal => goal.isCompleted)
  const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0

  const handleCreateGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.targetDate) {
      const targetDate = new Date(newGoal.targetDate)
      const monthsRemaining = Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)))
      const targetAmount = parseFloat(newGoal.targetAmount)
      
      const goal: Goal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount,
        currentAmount: 0,
        targetDate: newGoal.targetDate,
        category: newGoal.category,
        priority: newGoal.priority,
        progress: 0,
        monthsRemaining,
        monthlyTarget: monthsRemaining > 0 ? targetAmount / monthsRemaining : 0,
        isCompleted: false
      }
      
      setGoals([...goals, goal])
      setNewGoal({ name: '', targetAmount: '', targetDate: '', category: 'SAVINGS', priority: 'MEDIUM' })
      setShowCreateForm(false)
    }
  }

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'SAVINGS': return 'bg-blue-500/20 text-blue-400'
      case 'DEBT': return 'bg-red-500/20 text-red-400'
      case 'INVESTMENT': return 'bg-green-500/20 text-green-400'
      case 'PURCHASE': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Goals</p>
              <p className="text-2xl font-bold text-white">{activeGoals.length}</p>
            </div>
            <Target className="w-8 h-8 text-emerald-400" />
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
              <p className="text-slate-400 text-sm">Total Target</p>
              <p className="text-2xl font-bold text-white">${totalTargetAmount.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
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
              <p className="text-slate-400 text-sm">Saved So Far</p>
              <p className="text-2xl font-bold text-emerald-400">${totalCurrentAmount.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Overall Progress</p>
              <p className="text-2xl font-bold text-white">{overallProgress.toFixed(1)}%</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{Math.round(overallProgress)}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Goal Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Financial Goals</h3>
        <motion.button
          onClick={() => setShowCreateForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </motion.button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          <h4 className="text-lg font-semibold text-white mb-4">Create New Goal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Goal Name</label>
              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Emergency Fund"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Amount</label>
              <input
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Target Date</label>
              <input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Goal['category'] })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="SAVINGS">Savings</option>
                <option value="DEBT">Debt Payoff</option>
                <option value="INVESTMENT">Investment</option>
                <option value="PURCHASE">Purchase</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as Goal['priority'] })}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <motion.button
              onClick={handleCreateGoal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Goal
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

      {/* Active Goals */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Active Goals</h4>
        {activeGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h5 className="text-lg font-semibold text-white">{goal.name}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </span>
                  <span className={`text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority} Priority
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Target: {formatDate(goal.targetDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{goal.monthsRemaining} months left</span>
                  </div>
                </div>
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">
                  ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-emerald-400">
                  {goal.progress.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">
                  Monthly target: ${goal.monthlyTarget.toLocaleString()}
                </span>
                <span className="text-slate-400">
                  Remaining: ${(goal.targetAmount - goal.currentAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Completed Goals</span>
          </h4>
          {completedGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h5 className="text-lg font-semibold text-white">{goal.name}</h5>
                    <p className="text-sm text-emerald-400">
                      Goal completed • ${goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(goal.category)}`}>
                  {goal.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

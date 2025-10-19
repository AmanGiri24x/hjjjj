'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Target,
  Brain,
  Sparkles,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Bot
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import realFinancialService from '@/lib/services/realFinancialService'
import EnhancedFinnyChat from '@/components/ai/EnhancedFinnyChat'

interface FinancialMetric {
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ElementType
  color: string
  trend: number[]
}

interface AIInsight {
  id: string
  type: 'recommendation' | 'alert' | 'opportunity' | 'achievement'
  title: string
  description: string
  confidence: number
  actionable: boolean
  priority: 'high' | 'medium' | 'low'
}

export default function PersonalizedDashboard() {
  const { user } = useAuthStore()
  const [financialData, setFinancialData] = useState<any>(null)
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [showFinnyChat, setShowFinnyChat] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load real financial data
      const summary = await realFinancialService.getFinancialSummary()
      setFinancialData(summary)

      // Get AI insights
      const insights = await getAIInsights()
      setAiInsights(insights)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAIInsights = async (): Promise<AIInsight[]> => {
    try {
      // Simulate AI insights based on financial data
      return [
        {
          id: '1',
          type: 'recommendation',
          title: 'Optimize Your Savings',
          description: 'You could save ₹5,000 more monthly by reducing dining out expenses',
          confidence: 0.87,
          actionable: true,
          priority: 'high'
        },
        {
          id: '2',
          type: 'opportunity',
          title: 'Investment Opportunity',
          description: 'Consider starting a SIP with your surplus savings',
          confidence: 0.92,
          actionable: true,
          priority: 'medium'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Savings Goal Progress',
          description: 'You\'re 75% towards your emergency fund goal!',
          confidence: 1.0,
          actionable: false,
          priority: 'low'
        }
      ]
    } catch (error) {
      return []
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const formatCurrency = (amount: number) => {
    if (!showValues) return '••••••'
    return `₹${amount.toLocaleString()}`
  }

  const getMetrics = (): FinancialMetric[] => {
    if (!financialData) return []

    return [
      {
        label: 'Total Income',
        value: financialData.totalIncome || 0,
        change: 12.5,
        changeType: 'increase',
        icon: TrendingUp,
        color: 'emerald',
        trend: [65, 70, 68, 75, 72, 78, 82]
      },
      {
        label: 'Total Expenses',
        value: financialData.totalExpenses || 0,
        change: -5.2,
        changeType: 'decrease',
        icon: TrendingDown,
        color: 'rose',
        trend: [85, 82, 88, 78, 75, 72, 70]
      },
      {
        label: 'Net Savings',
        value: financialData.netSavings || 0,
        change: 18.7,
        changeType: 'increase',
        icon: PiggyBank,
        color: 'blue',
        trend: [45, 48, 52, 58, 62, 68, 75]
      },
      {
        label: 'Savings Rate',
        value: financialData.totalIncome > 0 ? 
          ((financialData.netSavings / financialData.totalIncome) * 100) : 0,
        change: 3.2,
        changeType: 'increase',
        icon: Target,
        color: 'purple',
        trend: [15, 17, 19, 22, 24, 26, 28]
      }
    ]
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return Brain
      case 'alert': return Activity
      case 'opportunity': return Sparkles
      case 'achievement': return Target
      default: return Brain
    }
  }

  const getInsightColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800'
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800'
      case 'low': return 'border-green-200 bg-green-50 text-green-800'
      default: return 'border-gray-200 bg-gray-50 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your personalized dashboard...</p>
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
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Welcome back, {user?.first_name || 'User'}
              </h1>
              <p className="text-gray-600 mt-1">Your personalized financial insights</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowValues(!showValues)}
                className="p-2 rounded-lg bg-white shadow-sm border hover:shadow-md transition-all"
                title={showValues ? 'Hide values' : 'Show values'}
              >
                {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white shadow-sm border hover:shadow-md transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setShowFinnyChat(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Bot className="w-4 h-4" />
                <span>Ask Finny</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getMetrics().map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${metric.color}-100`}>
                  {React.createElement(metric.icon, { className: `w-6 h-6 text-${metric.color}-600` })}
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.changeType === 'increase' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {metric.changeType === 'increase' ? 
                    <ArrowUpRight className="w-4 h-4" /> : 
                    <ArrowDownRight className="w-4 h-4" />
                  }
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.label === 'Savings Rate' ? 
                    (showValues ? `${metric.value.toFixed(1)}%` : '••••') :
                    formatCurrency(metric.value)
                  }
                </p>
              </div>

              {/* Mini Chart */}
              <div className="mt-4 h-12 flex items-end space-x-1">
                {metric.trend.map((point, i) => (
                  <div
                    key={i}
                    className={`flex-1 bg-${metric.color}-200 rounded-t opacity-60 group-hover:opacity-100 transition-opacity`}
                    style={{ height: `${(point / 100) * 100}%` }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-100 to-blue-100">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
                <p className="text-gray-600">Personalized recommendations for you</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowFinnyChat(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with Finny</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => {
              const IconComponent = getInsightIcon(insight.type)
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${getInsightColor(insight.priority)} hover:shadow-lg transition-all cursor-pointer`}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{insight.title}</h3>
                      <p className="text-xs opacity-80 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                        {insight.actionable && (
                          <button className="text-xs px-2 py-1 bg-white/50 rounded-md hover:bg-white/80 transition-colors">
                            Take Action
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Add Transaction', icon: Plus, color: 'blue' },
              { label: 'View Analytics', icon: BarChart3, color: 'green' },
              { label: 'Set Goals', icon: Target, color: 'purple' },
              { label: 'AI Analysis', icon: Zap, color: 'orange' }
            ].map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className={`p-4 rounded-xl bg-${action.color}-50 border-2 border-${action.color}-100 hover:border-${action.color}-200 hover:shadow-lg transition-all group`}
              >
                <action.icon className={`w-6 h-6 text-${action.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                <span className={`text-sm font-medium text-${action.color}-800`}>{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Finny Chat Modal */}
      <AnimatePresence>
        {showFinnyChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFinnyChat(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Finny AI Assistant</h3>
                    <p className="text-sm text-gray-500">Your personal financial advisor</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFinnyChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <EnhancedFinnyChat />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

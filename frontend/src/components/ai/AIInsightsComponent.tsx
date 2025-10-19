'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, TrendingDown, Target, AlertTriangle, Star, RefreshCw, Zap, BarChart3, Eye } from 'lucide-react'

interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'info' | 'critical'
  title: string
  description: string
  confidence: number
  action: string
  timeframe: string
  impact: 'low' | 'medium' | 'high'
  symbol?: string
  targetPrice?: number
  currentPrice?: number
  recommendation: 'BUY' | 'SELL' | 'HOLD' | 'MONITOR' | 'REBALANCE'
}

// Mock AI insights with realistic financial recommendations
const generateAIInsights = (): AIInsight[] => [
  {
    id: '1',
    type: 'opportunity',
    title: 'AAPL Breakout Pattern Detected',
    description: 'Apple Inc. (AAPL) shows strong momentum with 94% probability of upward breakout. Technical indicators suggest bullish divergence with increasing volume.',
    confidence: 94,
    action: 'BUY',
    timeframe: '1-2 weeks',
    impact: 'high',
    symbol: 'AAPL',
    targetPrice: 195.50,
    currentPrice: 187.25,
    recommendation: 'BUY'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Tech Sector Overextension',
    description: 'Technology sector showing signs of overvaluation. RSI above 75 with declining volume suggests potential correction.',
    confidence: 82,
    action: 'REDUCE',
    timeframe: '2-4 weeks',
    impact: 'medium',
    recommendation: 'MONITOR'
  },
  {
    id: '3',
    type: 'critical',
    title: 'Portfolio Risk Alert',
    description: 'Current portfolio concentration in growth stocks exceeds recommended levels. Consider diversification into value and defensive sectors.',
    confidence: 91,
    action: 'REBALANCE',
    timeframe: 'Immediate',
    impact: 'high',
    recommendation: 'REBALANCE'
  },
  {
    id: '4',
    type: 'opportunity',
    title: 'Energy Sector Recovery Signal',
    description: 'Energy sector showing early signs of recovery with improving fundamentals. Oil prices stabilizing above $80 support level.',
    confidence: 78,
    action: 'CONSIDER',
    timeframe: '1-3 months',
    impact: 'medium',
    recommendation: 'BUY'
  },
  {
    id: '5',
    type: 'info',
    title: 'Market Volatility Forecast',
    description: 'Expected market volatility increase due to upcoming earnings season. Consider protective strategies for large positions.',
    confidence: 85,
    action: 'PREPARE',
    timeframe: '2-3 weeks',
    impact: 'medium',
    recommendation: 'MONITOR'
  }
]

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'opportunity':
      return TrendingUp
    case 'warning':
      return AlertTriangle
    case 'critical':
      return Target
    default:
      return BarChart3
  }
}

const getInsightColors = (type: AIInsight['type']) => {
  switch (type) {
    case 'opportunity':
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
        icon: 'text-green-400'
      }
    case 'warning':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: 'text-yellow-400'
      }
    case 'critical':
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-400'
      }
    default:
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        icon: 'text-blue-400'
      }
  }
}

const getRecommendationColors = (recommendation: AIInsight['recommendation']) => {
  switch (recommendation) {
    case 'BUY':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'SELL':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'HOLD':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'MONITOR':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'REBALANCE':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export default function AIInsightsComponent() {
  const [insights, setInsights] = useState<AIInsight[]>(generateAIInsights())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [filter, setFilter] = useState<'all' | 'opportunity' | 'warning' | 'critical' | 'info'>('all')

  const refreshInsights = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setInsights(generateAIInsights())
    setIsRefreshing(false)
  }

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === filter)

  const priorityInsights = insights.filter(insight => 
    insight.type === 'critical' || (insight.type === 'opportunity' && insight.confidence > 90)
  )

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Neural Insights</h2>
            <p className="text-gray-400 text-sm">Real-time market analysis and recommendations</p>
          </div>
        </div>
        
        <motion.button
          onClick={refreshInsights}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-lg hover:bg-primary-500/30 transition-all duration-200 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Analyzing...' : 'Refresh'}</span>
        </motion.button>
      </div>

      {/* Priority Alerts */}
      {priorityInsights.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">Priority Alerts</h3>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            {priorityInsights.map((insight) => {
              const colors = getInsightColors(insight.type)
              const Icon = getInsightIcon(insight.type)
              
              return (
                <motion.div
                  key={insight.id}
                  className={`p-4 border rounded-xl ${colors.bg} ${colors.border} hover:bg-opacity-30 transition-all cursor-pointer`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 ${colors.icon} mt-1`} />
                      <div>
                        <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {insight.description.slice(0, 100)}...
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 border rounded-md text-xs font-medium ${getRecommendationColors(insight.recommendation)}`}>
                      {insight.recommendation}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
        {['all', 'opportunity', 'warning', 'critical', 'info'].map((filterType) => (
          <motion.button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 capitalize ${
              filter === filterType
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filterType}
            <span className="ml-1 text-xs opacity-75">
              ({filterType === 'all' ? insights.length : insights.filter(i => i.type === filterType).length})
            </span>
          </motion.button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredInsights.map((insight, index) => {
            const colors = getInsightColors(insight.type)
            const Icon = getInsightIcon(insight.type)
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`glass rounded-2xl p-6 border ${colors.border} hover:bg-white/5 transition-all cursor-pointer group`}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                    <span className={`text-sm font-medium ${colors.text} capitalize`}>
                      {insight.type}
                    </span>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${colors.icon.replace('text-', 'bg-')}`} />
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Confidence</div>
                    <div className={`font-bold ${colors.text}`}>{insight.confidence}%</div>
                  </div>
                </div>

                <h4 className="text-white font-bold text-lg mb-3 group-hover:text-primary-400 transition-colors">
                  {insight.title}
                </h4>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  {insight.description}
                </p>

                {insight.symbol && insight.currentPrice && insight.targetPrice && (
                  <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg">
                    <div>
                      <span className="text-white font-medium">{insight.symbol}</span>
                      <div className="text-gray-400 text-sm">Current: ${insight.currentPrice}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">Target: ${insight.targetPrice}</div>
                      <div className="text-sm text-green-400">
                        +{(((insight.targetPrice - insight.currentPrice) / insight.currentPrice) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 border rounded-md text-sm font-medium ${getRecommendationColors(insight.recommendation)}`}>
                      {insight.recommendation}
                    </div>
                    <span className="text-gray-400 text-sm">{insight.timeframe}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className={`w-4 h-4 ${insight.impact === 'high' ? 'text-yellow-400' : 'text-gray-500'}`} />
                    <span className="text-xs text-gray-400 capitalize">{insight.impact} impact</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Detailed Insight Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getInsightColors(selectedInsight.type).bg}`}>
                    {(() => {
                      const Icon = getInsightIcon(selectedInsight.type)
                      return <Icon className={`w-6 h-6 ${getInsightColors(selectedInsight.type).icon}`} />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedInsight.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-sm ${getInsightColors(selectedInsight.type).text} capitalize`}>
                        {selectedInsight.type}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400 text-sm">{selectedInsight.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Analysis</h4>
                  <p className="text-gray-300 leading-relaxed">{selectedInsight.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Recommendation</h4>
                    <div className={`inline-block px-4 py-2 border rounded-lg font-medium ${getRecommendationColors(selectedInsight.recommendation)}`}>
                      {selectedInsight.recommendation}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Timeframe</h4>
                    <p className="text-gray-300">{selectedInsight.timeframe}</p>
                  </div>
                </div>

                {selectedInsight.symbol && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Price Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Current Price</span>
                        <div className="text-white font-bold text-lg">${selectedInsight.currentPrice}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Target Price</span>
                        <div className="text-green-400 font-bold text-lg">${selectedInsight.targetPrice}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Impact Level:</span>
                    <span className={`text-sm font-medium capitalize ${
                      selectedInsight.impact === 'high' ? 'text-red-400' : 
                      selectedInsight.impact === 'medium' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}>
                      {selectedInsight.impact}
                    </span>
                  </div>
                  <motion.button
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedInsight(null)}
                  >
                    Got It
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

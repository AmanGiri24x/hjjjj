'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react'
import ApiService from '../services/api'

interface TradingSignal {
  symbol: string
  signal: string
  confidence: number
  reason: string
  action: string
}

export default function AIInsights() {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTradingSignals = async () => {
    try {
      setLoading(true)
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']
      const data = await ApiService.getTradingSignals(symbols, 'momentum')
      
      if (data && data.signals) {
        setSignals(data.signals)
      }
    } catch (error) {
      console.error('Failed to fetch AI signals:', error)
      // Fallback demo data
      setSignals([
        {
          symbol: 'AAPL',
          signal: 'BUY',
          confidence: 87,
          reason: 'Strong momentum with RSI oversold conditions',
          action: 'ACCUMULATE'
        },
        {
          symbol: 'TSLA',
          signal: 'HOLD',
          confidence: 72,
          reason: 'Mixed signals - consolidation phase detected',
          action: 'MONITOR'
        },
        {
          symbol: 'GOOGL',
          signal: 'SELL',
          confidence: 65,
          reason: 'Bearish divergence in momentum indicators',
          action: 'REDUCE'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTradingSignals()
    const interval = setInterval(fetchTradingSignals, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'SELL': return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'HOLD': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Brain className="w-5 h-5 text-primary-400 mr-2" />
        AI Neural Insights
        <div className="ml-auto">
          <span className="text-sm bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full">
            Real-time Analysis
          </span>
        </div>
      </h3>
      
      <div className="space-y-4">
        {signals.map((signal, index) => (
          <motion.div 
            key={`${signal.symbol}-${index}`}
            className={`p-4 border rounded-xl ${getSignalColor(signal.signal)} hover:bg-opacity-20 transition-all cursor-pointer group`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${
                  signal.signal === 'BUY' ? 'bg-green-400' : 
                  signal.signal === 'SELL' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
                <span className="font-semibold text-white">{signal.symbol} - {signal.signal}</span>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-75">Confidence</div>
                <div className="font-bold">{signal.confidence}%</div>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">
              {signal.reason}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 opacity-60" />
                <span className="text-xs font-medium opacity-80">Action: {signal.action}</span>
              </div>
              <div className="text-xs opacity-60">
                Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

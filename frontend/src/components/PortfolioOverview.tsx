'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, TrendingUp, DollarSign, Target } from 'lucide-react'
import ApiService from '../services/api'

interface PortfolioData {
  totalValue: number
  dayChange: number
  dayChangePercent: number
  holdings: Array<{
    symbol: string
    shares: number
    value: number
    weight: number
    change: number
  }>
}

export default function PortfolioOverview() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      // Try to get real portfolio optimization data
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']
      const optimizationData = await ApiService.optimizePortfolio(symbols, 'max_sharpe')
      
      if (optimizationData && optimizationData.weights) {
        // Convert optimization weights to portfolio holdings
        const holdings = Object.entries(optimizationData.weights).map(([symbol, weight]: [string, any]) => ({
          symbol,
          shares: Math.floor((weight * 100000) / 150), // Simulate shares
          value: weight * 100000,
          weight: weight * 100,
          change: (Math.random() - 0.5) * 10 // Random daily change
        }))
        
        const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
        const dayChange = holdings.reduce((sum, holding) => sum + holding.change, 0)
        
        setPortfolio({
          totalValue,
          dayChange,
          dayChangePercent: (dayChange / totalValue) * 100,
          holdings
        })
      }
    } catch (error) {
      console.error('Failed to fetch portfolio data:', error)
      // Fallback demo data
      setPortfolio({
        totalValue: 127543,
        dayChange: 2341,
        dayChangePercent: 1.87,
        holdings: [
          { symbol: 'AAPL', shares: 50, value: 45000, weight: 35.3, change: 850 },
          { symbol: 'GOOGL', shares: 30, value: 35000, weight: 27.4, change: 420 },
          { symbol: 'MSFT', shares: 25, value: 28000, weight: 22.0, change: 680 },
          { symbol: 'TSLA', shares: 15, value: 19543, weight: 15.3, change: 391 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolioData()
    const interval = setInterval(fetchPortfolioData, 120000) // Update every 2 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading || !portfolio) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <PieChart className="w-5 h-5 text-primary-400 mr-2" />
        Portfolio Intelligence
      </h3>
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ${portfolio.totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary-400" />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today's P&L</p>
              <p className={`text-2xl font-bold ${portfolio.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolio.dayChange >= 0 ? '+' : ''}${portfolio.dayChange.toLocaleString()}
              </p>
            </div>
            <TrendingUp className={`w-8 h-8 ${portfolio.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Performance</p>
              <p className={`text-2xl font-bold ${portfolio.dayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolio.dayChangePercent >= 0 ? '+' : ''}{portfolio.dayChangePercent.toFixed(2)}%
              </p>
            </div>
            <Target className={`w-8 h-8 ${portfolio.dayChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white mb-3">Holdings</h4>
        {portfolio.holdings.map((holding, index) => (
          <motion.div
            key={holding.symbol}
            className="glass rounded-xl p-4 hover:bg-white/5 transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{holding.symbol}</span>
                </div>
                <div>
                  <h5 className="font-semibold text-white">{holding.symbol}</h5>
                  <p className="text-gray-400 text-sm">{holding.shares} shares</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-white">${holding.value.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">{holding.weight.toFixed(1)}% weight</p>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${holding.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {holding.change >= 0 ? '+' : ''}${holding.change.toFixed(0)}
                </p>
                <p className="text-gray-400 text-sm">Today</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

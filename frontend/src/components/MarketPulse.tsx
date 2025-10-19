'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react'
import ApiService from '../services/api'

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export default function MarketPulse() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN']

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      const data = await ApiService.getBatchQuotes(symbols)
      
      if (data && data.quotes) {
        const formattedData = Object.entries(data.quotes).map(([symbol, quote]: [string, any]) => ({
          symbol,
          price: quote.regularMarketPrice || quote.price || 0,
          change: quote.regularMarketChange || quote.change || 0,
          changePercent: quote.regularMarketChangePercent || quote.changePercent || 0
        }))
        setMarketData(formattedData)
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      // Fallback demo data
      setMarketData([
        { symbol: 'AAPL', price: 175.43, change: 2.34, changePercent: 1.35 },
        { symbol: 'GOOGL', price: 142.56, change: -1.23, changePercent: -0.85 },
        { symbol: 'MSFT', price: 378.85, change: 4.12, changePercent: 1.10 },
        { symbol: 'TSLA', price: 248.42, change: -3.45, changePercent: -1.37 },
        { symbol: 'NVDA', price: 875.28, change: 12.45, changePercent: 1.44 },
        { symbol: 'AMZN', price: 145.86, change: 0.95, changePercent: 0.66 }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Activity className="w-5 h-5 text-primary-400 mr-2" />
          Market Pulse
          <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <motion.button
            onClick={fetchMarketData}
            disabled={loading}
            className="p-2 glass rounded-lg hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {marketData.map((stock, index) => (
          <motion.div
            key={stock.symbol}
            className="glass rounded-xl p-4 hover:bg-white/5 transition-all cursor-pointer group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="text-center">
              <h4 className="font-bold text-white text-sm mb-1">{stock.symbol}</h4>
              <p className="text-lg font-bold text-white mb-1">
                ${stock.price.toFixed(2)}
              </p>
              <div className={`flex items-center justify-center space-x-1 text-xs ${
                stock.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stock.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}</span>
                <span>({stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

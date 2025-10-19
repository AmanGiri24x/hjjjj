'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Globe, TrendingUp, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Portfolio3D from '../../components/Portfolio3D'

interface TopPerformer {
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  change_percent: number
  market_cap: number
}

interface SectorData {
  avg_change: number
  total_market_cap: number
  stock_count: number
}

export default function Portfolio3DPage() {
  const router = useRouter()
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [sectors, setSectors] = useState<Record<string, SectorData>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async () => {
    try {
      const [performersRes, sectorsRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/indian-market/top-performers'),
        fetch('http://localhost:8001/api/v1/indian-market/sectors')
      ])

      const performersData = await performersRes.json()
      const sectorsData = await sectorsRes.json()

      if (performersData.success) {
        setTopPerformers(performersData.data)
      }

      if (sectorsData.success) {
        setSectors(sectorsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 glass rounded-xl hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Sparkles className="w-8 h-8 text-primary-400 mr-3" />
                3D Portfolio Universe
              </h1>
              <p className="text-gray-400 mt-1">
                Explore Indian stock market in an immersive 3D environment
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 glass rounded-xl px-4 py-2">
            <Globe className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Live NSE/BSE Data</span>
          </div>
        </motion.div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
              Top Gainers
            </h3>
            <div className="space-y-3">
              {topPerformers.slice(0, 5).map((stock, index) => (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium text-sm">{stock.symbol}</div>
                    <div className="text-gray-400 text-xs">{stock.sector}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium text-sm">
                      +{stock.change_percent.toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-xs">
                      ₹{stock.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sector Performance */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Sector Performance</h3>
            <div className="space-y-3">
              {Object.entries(sectors).slice(0, 5).map(([sector, data]) => (
                <div key={sector} className="flex items-center justify-between">
                  <div className="text-white text-sm">{sector}</div>
                  <div className={`text-sm font-medium ${
                    data.avg_change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {data.avg_change >= 0 ? '+' : ''}{data.avg_change.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Market Stats */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Market Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-sm">Total Companies</div>
                <div className="text-white font-bold text-xl">15</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Sectors Covered</div>
                <div className="text-white font-bold text-xl">{Object.keys(sectors).length}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Update Frequency</div>
                <div className="text-primary-400 font-medium">Real-time</div>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">Click planets to view company details</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-primary-400 rounded-full mt-1 flex-shrink-0"></div>
                <span className="text-gray-300">Drag to rotate the universe</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
                <span className="text-gray-300">Scroll to zoom in/out</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full mt-1 flex-shrink-0"></div>
                <span className="text-gray-300">Bookmark favorite stocks</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3D Portfolio Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Portfolio3D />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Real-time Data</h3>
            <p className="text-gray-400 text-sm">
              Live NSE/BSE stock prices updated every 30 seconds with accurate market data
            </p>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Interactive 3D</h3>
            <p className="text-gray-400 text-sm">
              Immersive 3D visualization with planets representing top Indian companies
            </p>
          </div>

          <div className="glass rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-400 text-sm">
              Detailed company information, performance metrics, and sector analysis
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Target, Search, TrendingUp, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MarketScannerPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 cyber-grid">
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => router.back()}
                className="p-3 glass rounded-xl hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </motion.button>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <Target className="w-8 h-8 text-primary-400 mr-3" />
                Market Scanner
              </h1>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="glass rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Market Scanner Coming Soon</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Advanced market scanning tools powered by AI to identify high-probability trading opportunities 
              and market trends in real-time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass rounded-2xl p-6">
                <Search className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Smart Filters</h3>
                <p className="text-gray-400 text-sm">Custom filters for technical patterns and fundamental metrics</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Trend Analysis</h3>
                <p className="text-gray-400 text-sm">Real-time trend detection and momentum indicators</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <Globe className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Global Markets</h3>
                <p className="text-gray-400 text-sm">Scan opportunities across multiple asset classes and regions</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

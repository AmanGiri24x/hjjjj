'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, Shield, BarChart3, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RiskAnalysisPage() {
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
                <AlertTriangle className="w-8 h-8 text-primary-400 mr-3" />
                Risk Analytics
              </h1>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="glass rounded-3xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Risk Analytics Coming Soon</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Advanced risk management tools with real-time portfolio monitoring, stress testing, 
              and optimization strategies to protect and grow your investments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass rounded-2xl p-6">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Portfolio Protection</h3>
                <p className="text-gray-400 text-sm">Dynamic hedging strategies and downside protection</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Risk Metrics</h3>
                <p className="text-gray-400 text-sm">VaR, CVaR, Sharpe ratio, and advanced risk measurements</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <Target className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Scenario Analysis</h3>
                <p className="text-gray-400 text-sm">Stress testing under various market conditions</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  Globe, 
  TrendingUp, 
  ArrowUpRight,
  Target,
  Activity
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function SimpleDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [mounted, isAuthenticated, router])

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.first_name || 'User'}!
          </h1>
          <p className="text-gray-400 text-lg">
            Your AI-powered financial analytics dashboard
          </p>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-green-400 font-semibold">Registration Successful!</h3>
              <p className="text-gray-300 text-sm">
                Your account has been created and you're now logged in to DhanAillytics.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.button
            onClick={() => router.push('/portfolio-3d')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">3D Portfolio Universe</h3>
            <p className="text-gray-400 text-sm mb-4">
              Explore Indian stock market in immersive 3D visualization
            </p>
            <div className="flex items-center text-primary-400 text-sm font-medium">
              <span>Explore Now</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get personalized trading recommendations powered by AI
            </p>
            <div className="text-purple-400 text-sm font-medium">Coming Soon</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Portfolio Analytics</h3>
            <p className="text-gray-400 text-sm mb-4">
              Advanced portfolio analysis and risk management
            </p>
            <div className="text-green-400 text-sm font-medium">Coming Soon</div>
          </motion.div>
        </div>

        {/* Featured Section - 3D Portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Experience the Future of Portfolio Visualization
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our revolutionary 3D portfolio visualization represents Indian stock market companies 
              as interactive planets orbiting around a central sun, providing an immersive way to 
              explore your investments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Real-time Data</h3>
              <p className="text-gray-400 text-sm">
                Live NSE/BSE stock prices updated every 30 seconds
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Interactive 3D</h3>
              <p className="text-gray-400 text-sm">
                Click planets to explore detailed company information
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-400 text-sm">
                AI-powered insights and performance metrics
              </p>
            </div>
          </div>

          <div className="text-center">
            <motion.button
              onClick={() => router.push('/portfolio-3d')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center space-x-2 mx-auto"
            >
              <span>Launch 3D Portfolio Universe</span>
              <ArrowUpRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

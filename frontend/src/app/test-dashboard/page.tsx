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
  Activity,
  Brain,
  User,
  LogOut
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function TestDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [mounted, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">DhanAilytics</h1>
                <p className="text-xs text-gray-400">AI-Powered Analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user.first_name}!</span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
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
              <h3 className="text-green-400 font-semibold">Dashboard Loaded Successfully!</h3>
              <p className="text-gray-300 text-sm">
                Welcome to DhanAilytics - Your AI-powered financial analytics platform is ready.
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
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-700/50 transition-all group text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">3D Portfolio Universe</h3>
            <p className="text-gray-400 text-sm mb-4">
              Explore Indian stock market in immersive 3D visualization
            </p>
            <div className="flex items-center text-primary-400 text-sm font-medium">
              <span>Launch Now</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">AI Trading Signals</h3>
            <p className="text-gray-400 text-sm mb-4">
              Get personalized trading recommendations powered by AI
            </p>
            <div className="text-purple-400 text-sm font-medium">Coming Soon</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
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
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8"
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

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 text-sm">Name:</span>
              <p className="text-white">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Email:</span>
              <p className="text-white">{user.email}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, TrendingUp, Shield, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const stats = [
  { value: '$2.5B+', label: 'Assets Under Management' },
  { value: '50K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime Guarantee' },
]

export default function Hero() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/signup')
    }
  }
  
  const handleViewDemo = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative bg-gradient-to-b from-slate-50 to-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6">
              Ship high-quality{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FinTech
              </span>
              , fast
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              An open-source platform for managing the complete financial analytics lifecycle. 
              From portfolio tracking to AI-powered insights and automated trading strategies.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {[
              { icon: TrendingUp, text: 'Portfolio Analytics' },
              { icon: Shield, text: 'Risk Management' },
              { icon: Zap, text: 'Real-time Trading' }
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm"
              >
                <item.icon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={handleGetStarted}
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Get started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={handleViewDemo}
              className="group bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-lg font-semibold text-lg border border-slate-200 transition-all duration-200 flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>View demo</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

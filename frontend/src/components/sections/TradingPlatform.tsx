'use client'

import { motion } from 'framer-motion'
import { BarChart3, Activity, Zap, Globe, ArrowRight, Play } from 'lucide-react'

const tradingFeatures = [
  {
    icon: Activity,
    title: 'Real-time Trading',
    description: 'Execute trades instantly with our high-performance trading engine.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive market analysis with professional-grade charting tools.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Zap,
    title: 'Automated Strategies',
    description: 'Deploy algorithmic trading strategies with backtesting capabilities.',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: Globe,
    title: 'Global Markets',
    description: 'Access to stocks, forex, crypto, and commodities worldwide.',
    color: 'bg-orange-100 text-orange-600'
  }
]

export default function TradingPlatform() {
  return (
    <section className="py-20 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <Activity className="w-4 h-4" />
                <span>Trading Platform</span>
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
            >
              Mastering the{' '}
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                trading lifecycle
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 mb-8 leading-relaxed"
            >
              From strategy development to execution and monitoring. Our comprehensive 
              trading platform provides everything you need to succeed in financial markets.
            </motion.p>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
            >
              {tradingFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                <span>Start trading</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-lg font-semibold border border-slate-200 transition-all duration-200 flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch demo</span>
              </button>
            </motion.div>
          </div>

          {/* Right Content - Trading Interface Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
              {/* Mock Trading Interface */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Portfolio Overview</h3>
                  <span className="text-green-600 font-semibold">+12.5%</span>
                </div>
                
                {/* Chart Area */}
                <div className="bg-slate-50 rounded-lg h-48 mb-4 flex items-center justify-center">
                  <div className="text-slate-400">
                    <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">Interactive Trading Charts</p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">$125K</div>
                    <div className="text-sm text-slate-600">Total Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+$15K</div>
                    <div className="text-sm text-slate-600">Today's P&L</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-sm text-slate-600">Active Positions</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Live Trading
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Real-time Data
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

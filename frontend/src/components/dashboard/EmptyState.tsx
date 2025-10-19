'use client'

import { motion } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  Target, 
  PieChart, 
  ArrowRight,
  Sparkles,
  Shield,
  BarChart3
} from 'lucide-react'

interface EmptyStateProps {
  onGetStarted: () => void
}

export default function EmptyState({ onGetStarted }: EmptyStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">DhanAillytics</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Your AI-powered financial companion. Start your journey to financial freedom by setting up your first financial data.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: TrendingUp,
              title: 'Track Income & Expenses',
              description: 'Monitor your cash flow with intelligent categorization and insights',
              color: 'from-green-500 to-emerald-600'
            },
            {
              icon: Target,
              title: 'Set Financial Goals',
              description: 'Define and track progress towards your financial objectives',
              color: 'from-blue-500 to-cyan-600'
            },
            {
              icon: PieChart,
              title: 'Budget Planning',
              description: 'Create smart budgets and get AI-powered spending recommendations',
              color: 'from-purple-500 to-violet-600'
            },
            {
              icon: BarChart3,
              title: 'Investment Tracking',
              description: 'Monitor your portfolio performance and growth over time',
              color: 'from-orange-500 to-red-600'
            },
            {
              icon: Shield,
              title: 'Secure & Private',
              description: 'Bank-level security with end-to-end encryption for your data',
              color: 'from-indigo-500 to-purple-600'
            },
            {
              icon: Sparkles,
              title: 'AI Insights',
              description: 'Get personalized recommendations to optimize your finances',
              color: 'from-pink-500 to-rose-600'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 hover:border-slate-500/50 transition-all group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/50 rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to take control of your finances?</h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Start by adding your first income, expense, or financial goal. Our AI will help you build a comprehensive financial picture.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 shadow-xl hover:shadow-2xl transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <div className="text-sm text-slate-400">
                No credit card required • Free to start
              </div>
            </div>
          </div>

          {/* Quick Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Users Trust Us', value: '10,000+' },
              { label: 'Transactions Tracked', value: '₹50M+' },
              { label: 'Goals Achieved', value: '5,000+' },
              { label: 'Security Rating', value: 'A+' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  BarChart3, 
  Shield, 
  Zap, 
  TrendingUp, 
  Globe, 
  Smartphone, 
  Clock,
  Bot,
  Database,
  Eye,
  Layers
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analytics',
    description: 'Advanced machine learning algorithms analyze market patterns and predict trends with 95% accuracy.',
    color: 'from-purple-500 to-violet-600',
    delay: 0
  },
  {
    icon: BarChart3,
    title: '3D Data Visualization',
    description: 'Immersive 3D charts and interactive visualizations make complex data intuitive and engaging.',
    color: 'from-blue-500 to-cyan-600',
    delay: 0.1
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Enterprise-level encryption and multi-factor authentication protect your sensitive financial data.',
    color: 'from-green-500 to-emerald-600',
    delay: 0.2
  },
  {
    icon: Zap,
    title: 'Real-Time Processing',
    description: 'Lightning-fast data processing with sub-millisecond latency for real-time market insights.',
    color: 'from-yellow-500 to-orange-600',
    delay: 0.3
  },
  {
    icon: TrendingUp,
    title: 'Smart Portfolio Optimization',
    description: 'AI-driven portfolio rebalancing suggestions based on risk tolerance and market conditions.',
    color: 'from-pink-500 to-rose-600',
    delay: 0.4
  },
  {
    icon: Globe,
    title: 'Global Market Coverage',
    description: 'Access to 50+ global markets with real-time data from NYSE, NASDAQ, LSE, and more.',
    color: 'from-indigo-500 to-purple-600',
    delay: 0.5
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform Sync',
    description: 'Seamless synchronization across all devices with native mobile apps and web interface.',
    color: 'from-teal-500 to-cyan-600',
    delay: 0.6
  },
  {
    icon: Clock,
    title: '24/7 Market Monitoring',
    description: 'Round-the-clock market surveillance with instant alerts for significant portfolio changes.',
    color: 'from-red-500 to-pink-600',
    delay: 0.7
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description: 'Conversational AI that answers questions and provides personalized investment insights.',
    color: 'from-violet-500 to-purple-600',
    delay: 0.8
  },
  {
    icon: Database,
    title: 'Big Data Analytics',
    description: 'Process millions of data points from news, social media, and market feeds for comprehensive analysis.',
    color: 'from-emerald-500 to-teal-600',
    delay: 0.9
  },
  {
    icon: Eye,
    title: 'Risk Assessment',
    description: 'Advanced risk modeling with stress testing and scenario analysis for informed decision making.',
    color: 'from-orange-500 to-red-600',
    delay: 1.0
  },
  {
    icon: Layers,
    title: 'Multi-Asset Support',
    description: 'Comprehensive support for stocks, bonds, ETFs, cryptocurrencies, commodities, and derivatives.',
    color: 'from-cyan-500 to-blue-600',
    delay: 1.1
  }
]

export default function Features() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <motion.h2 
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Revolutionary Features
        </motion.h2>
        <motion.p 
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Experience the future of financial analytics with cutting-edge technology 
          that transforms how you understand and manage your investments
        </motion.p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              transition: { duration: 0.2 }
            }}
            className="glass rounded-2xl p-6 hover-lift cursor-pointer relative overflow-hidden group"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
            
            <div className="relative z-10">
              {/* Icon */}
              <motion.div 
                className={`p-4 rounded-xl bg-gradient-to-br ${feature.color} neon-blue mb-4 w-fit`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </motion.div>
              
              {/* Content */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-glow-blue transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover Effect Arrow */}
              <motion.div
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary-400" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-center mt-16"
      >
        <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-accent-900/20 rounded-3xl" />
          <div className="relative z-10">
            <motion.h3 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Ready to Transform Your Financial Future?
            </motion.h3>
            <motion.p 
              className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Join thousands of investors who are already using DhanAillytics to make smarter, 
              data-driven investment decisions with our revolutionary AI platform.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(6, 182, 212, 0.6)"
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary-500 to-accent-500 text-white px-8 py-4 rounded-xl font-semibold text-lg neon-blue"
              >
                Start Free Trial
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:border-primary-400/50 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

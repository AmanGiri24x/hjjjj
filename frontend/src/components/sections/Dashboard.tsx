'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity } from 'lucide-react'

// Mock data for demonstration
const metrics = [
  {
    title: 'Portfolio Value',
    value: '$2,847,392',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-green-400 to-emerald-600'
  },
  {
    title: 'Monthly Return',
    value: '+8.2%',
    change: '+2.1%',
    trend: 'up',
    icon: TrendingUp,
    color: 'from-blue-400 to-cyan-600'
  },
  {
    title: 'Risk Score',
    value: '6.4/10',
    change: '-0.3',
    trend: 'down',
    icon: Activity,
    color: 'from-purple-400 to-violet-600'
  },
  {
    title: 'Diversification',
    value: '85%',
    change: '+5%',
    trend: 'up',
    icon: PieChart,
    color: 'from-pink-400 to-rose-600'
  }
]

const chartData = [
  { name: 'Jan', value: 2400 },
  { name: 'Feb', value: 2210 },
  { name: 'Mar', value: 2290 },
  { name: 'Apr', value: 2000 },
  { name: 'May', value: 2181 },
  { name: 'Jun', value: 2500 },
  { name: 'Jul', value: 2100 },
  { name: 'Aug', value: 2400 },
  { name: 'Sep', value: 2700 },
  { name: 'Oct', value: 2900 },
  { name: 'Nov', value: 3200 },
  { name: 'Dec', value: 2847 }
]

export default function Dashboard() {
  const [selectedMetric, setSelectedMetric] = useState(0)

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className="space-y-8"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className="glass rounded-2xl p-6 hover-lift cursor-pointer relative overflow-hidden"
            onClick={() => setSelectedMetric(index)}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-10 rounded-2xl`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} neon-blue`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{metric.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-gray-400 text-sm">{metric.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-accent-900/20 rounded-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Portfolio Performance</h3>
              <p className="text-gray-400">12-month trend analysis</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30 hover:bg-primary-500/30 transition-colors">
                1Y
              </button>
              <button className="px-4 py-2 text-gray-400 rounded-lg hover:bg-white/10 transition-colors">
                6M
              </button>
              <button className="px-4 py-2 text-gray-400 rounded-lg hover:bg-white/10 transition-colors">
                3M
              </button>
            </div>
          </div>

          {/* Simple Chart Visualization */}
          <div className="relative h-64 flex items-end space-x-2">
            {chartData.map((data, index) => {
              const height = (data.value / 3200) * 100
              return (
                <motion.div
                  key={data.name}
                  className="flex-1 bg-gradient-to-t from-primary-500/50 to-accent-500/50 rounded-t-lg relative group cursor-pointer"
                  style={{ height: `${height}%` }}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    ${data.value}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs">
                    {data.name}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* AI Insights Preview */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h4 className="text-lg font-semibold text-white">AI Recommendation</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Based on market analysis, consider increasing your tech sector allocation by 5% 
              to capitalize on upcoming earnings season.
            </p>
            <div className="text-sm text-green-400 font-medium">
              Confidence: 87% • Risk: Low
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <h4 className="text-lg font-semibold text-white">Market Alert</h4>
            </div>
            <p className="text-gray-300 mb-4">
              Volatility expected in emerging markets due to upcoming policy announcements. 
              Monitor exposure closely.
            </p>
            <div className="text-sm text-yellow-400 font-medium">
              Impact: Medium • Timeline: 2-3 days
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

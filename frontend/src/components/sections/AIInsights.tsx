'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Lightbulb, TrendingUp, Cpu, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'

const insights = [
  {
    category: 'Market Trend',
    title: 'Bullish momentum detected in semiconductor sector',
    summary: 'Our AI model identifies a strong buying signal in the semiconductor industry, driven by increased demand for AI hardware. Key stocks to watch: NVDA, AMD, TSM.',
    confidence: '92%',
    impact: 'High',
    timeline: '4-6 weeks',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    category: 'Risk Alert',
    title: 'Increased volatility in emerging market bonds',
    summary: 'Geopolitical tensions and inflation concerns are causing heightened risk in emerging market debt. We recommend reducing exposure by 15-20%.',
    confidence: '88%',
    impact: 'Medium',
    timeline: 'Immediate',
    color: 'from-red-500 to-orange-600'
  },
  {
    category: 'Growth Opportunity',
    title: 'Breakthrough in green hydrogen technology',
    summary: 'AI has flagged several small-cap companies with promising patents in green hydrogen production. This sector could see exponential growth in the next 1-2 years.',
    confidence: '78%',
    impact: 'High',
    timeline: '12-24 months',
    color: 'from-green-500 to-emerald-600'
  },
  {
    category: 'Portfolio Optimization',
    title: 'Over-exposure to US large-cap tech detected',
    summary: 'Your portfolio is heavily concentrated in US tech giants. Consider diversifying into international markets or other sectors like healthcare to mitigate risk.',
    confidence: '95%',
    impact: 'Medium',
    timeline: 'Action recommended',
    color: 'from-purple-500 to-violet-600'
  }
]

export default function AIInsights() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextInsight = () => {
    setCurrentIndex((prevIndex) => (prevIndex === insights.length - 1 ? 0 : prevIndex + 1))
  }

  const prevInsight = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? insights.length - 1 : prevIndex - 1))
  }
  
  const insight = insights[currentIndex]

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
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] as const }
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
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-400 via-primary-400 to-accent-400 bg-clip-text text-transparent mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          AI-Powered Insights
        </motion.h2>
        <motion.p 
          className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Go beyond raw data. Our advanced AI provides actionable insights and 
          intelligent recommendations to guide your investment strategy.
        </motion.p>
      </motion.div>

      {/* Insight Display */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: AI Brain Graphic */}
        <motion.div 
          className="w-full lg:w-1/3 flex items-center justify-center relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative">
            <Cpu className="w-64 h-64 text-primary-500/50" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <Bot className="w-48 h-48 text-primary-400" />
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-56 h-56 text-accent-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Right Panel: Insight Details */}
        <motion.div 
          className="w-full lg:w-2/3 glass rounded-2xl p-8 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
        >
          {/* Background Gradient */}
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-br ${insight.color} opacity-10 rounded-2xl`} 
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 0.5 }}
          />

          <div className="relative z-10">
            {/* Header */}
            <motion.div
              key={`${currentIndex}-header`}
              variants={itemVariants}
              className="flex items-center justify-between mb-4"
            >
              <div className={`px-4 py-1 bg-gradient-to-r ${insight.color} text-white rounded-full text-sm font-semibold`}>
                {insight.category}
              </div>
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-white">Insight #{currentIndex + 1}</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h3 
              key={`${currentIndex}-title`}
              variants={itemVariants}
              className="text-2xl font-bold text-white mb-4"
            >
              {insight.title}
            </motion.h3>

            {/* Summary */}
            <motion.p 
              key={`${currentIndex}-summary`}
              variants={itemVariants}
              className="text-gray-300 mb-6"
            >
              {insight.summary}
            </motion.p>
            
            {/* Details */}
            <motion.div 
              key={`${currentIndex}-details`}
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-1">Confidence</div>
                <div className="text-lg font-bold text-white">{insight.confidence}</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-1">Impact</div>
                <div className="text-lg font-bold text-white">{insight.impact}</div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-1">Timeline</div>
                <div className="text-lg font-bold text-white">{insight.timeline}</div>
              </div>
            </motion.div>
          </div>
          
          {/* Navigation */}
          <div className="absolute bottom-6 right-6 flex space-x-2">
            <motion.button 
              onClick={prevInsight}
              className="p-2 glass rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button 
              onClick={nextInsight}
              className="p-2 glass rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

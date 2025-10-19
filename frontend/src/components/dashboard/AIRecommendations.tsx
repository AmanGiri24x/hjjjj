'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Lightbulb, TrendingUp, Shield, HelpCircle, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'

interface Recommendation {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: 'savings' | 'investment' | 'debt' | 'general'
  savings?: number
}

export default function AIRecommendations() {
  const { theme } = useTheme()
  
  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Cut down on entertainment by 10%',
      description: 'and you\'ll save an extra ₹500/month.',
      impact: 'high',
      category: 'savings',
      savings: 500
    },
    {
      id: '2',
      title: 'Switch to a cheaper utility provider',
      description: 'and save ₹300/month.',
      impact: 'medium',
      category: 'savings',
      savings: 300
    },
    {
      id: '3',
      title: 'Automate your savings',
      description: 'by moving ₹1000 to your savings account each week.',
      impact: 'high',
      category: 'savings',
      savings: 4000
    }
  ]

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getImpactBg = (impact: string) => {
    switch (impact) {
      case 'high': return theme === 'dark' ? 'bg-green-900/30 border-green-500/20' : 'bg-green-100 border-green-200'
      case 'medium': return theme === 'dark' ? 'bg-yellow-900/30 border-yellow-500/20' : 'bg-yellow-100 border-yellow-200'
      case 'low': return theme === 'dark' ? 'bg-blue-900/30 border-blue-500/20' : 'bg-blue-100 border-blue-200'
      default: return theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-100 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Personalized Recommendations
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered insights for your finances
            </p>
          </div>
        </div>
        <button className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:scale-105 transition-all`}>
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg ${getImpactBg(rec.impact)} border`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  rec.impact === 'high' ? 'bg-green-500' : 
                  rec.impact === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}>
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {rec.title}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {rec.description}
                  </div>
                  {rec.savings && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 text-sm font-medium">
                        Save ₹{rec.savings.toLocaleString()}/month
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(rec.impact)} ${
                  rec.impact === 'high' ? 'bg-green-500/20' :
                  rec.impact === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                }`}>
                  {rec.impact.toUpperCase()}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Potential monthly savings
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-green-500 font-semibold">
              ₹{recommendations.reduce((sum, rec) => sum + (rec.savings || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

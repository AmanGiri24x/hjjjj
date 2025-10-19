'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Target, Shield, TrendingUp, Users, Crown, Sparkles } from 'lucide-react'

export default function FeatureHighlights() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: Brain,
      title: "Finny AI Co-Pilot",
      description: "Your personal AI financial advisor that never sleeps",
      details: "Advanced machine learning analyzes market patterns 24/7 to maximize your returns",
      color: "from-purple-500 to-pink-500",
      demo: "Ask me anything about your portfolio..."
    },
    {
      icon: Target,
      title: "Quantum Risk Modeling",
      description: "Military-grade risk assessment technology",
      details: "Simulates 1000+ market scenarios to protect your investments",
      color: "from-emerald-500 to-cyan-500",
      demo: "Risk Level: LOW (2.3%) - Portfolio Protected"
    },
    {
      icon: Crown,
      title: "Expert Network",
      description: "Direct access to Wall Street professionals",
      details: "Chat with top traders and financial experts instantly",
      color: "from-yellow-500 to-orange-500",
      demo: "Connect with Expert: Michael Chen, Goldman Sachs"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="text-blue-400 font-semibold">Revolutionary Technology</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Features That Make
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Money While You Sleep
            </span>
          </h2>
        </motion.div>

        {/* Interactive Feature Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Feature List */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setActiveFeature(index)}
                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  activeFeature === index
                    ? 'bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-emerald-500/50 scale-105'
                    : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 mb-3">{feature.description}</p>
                    <p className="text-sm text-slate-500">{feature.details}</p>
                  </div>
                  {activeFeature === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 bg-emerald-400 rounded-full"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Demo */}
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${features[activeFeature].color} rounded-2xl flex items-center justify-center`}>
                  {React.createElement(features[activeFeature].icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{features[activeFeature].title}</h3>
                  <p className="text-slate-400 text-sm">Live Demo</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm">Active</span>
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-2xl p-6 mb-6">
              <div className="text-emerald-400 font-mono text-sm mb-2">
                {features[activeFeature].demo}
              </div>
              <div className="w-2 h-4 bg-emerald-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-emerald-400 text-2xl font-bold">+$2,847</div>
                <div className="text-slate-400 text-sm">This Month</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <div className="text-cyan-400 text-2xl font-bold">98.7%</div>
                <div className="text-slate-400 text-sm">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "10,000+", label: "Data Points/Sec", icon: Brain },
            { value: "24/7", label: "Market Monitoring", icon: Shield },
            { value: "340%", label: "Avg. Returns", icon: TrendingUp },
            { value: "150K+", label: "Happy Users", icon: Users }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

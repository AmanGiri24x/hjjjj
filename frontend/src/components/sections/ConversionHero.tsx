'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap,
  Crown,
  Star,
  Play,
  CheckCircle,
  Users,
  DollarSign,
  Brain
} from 'lucide-react'

export default function ConversionHero() {
  const [currentStat, setCurrentStat] = useState(0)

  const stats = [
    { value: '$2.4B+', label: 'Assets Protected', icon: Shield },
    { value: '150K+', label: 'Happy Users', icon: Users },
    { value: '98.7%', label: 'Success Rate', icon: TrendingUp },
    { value: '24/7', label: 'AI Support', icon: Brain }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* MLflow-inspired background is now handled by parent container */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-gray-900/10 to-blue-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Urgency Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-full px-6 py-3 mb-8"
        >
          <Sparkles className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <span className="text-emerald-400 font-semibold">Limited Time: 90% OFF First Month</span>
          <Crown className="w-5 h-5 text-yellow-400" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
        >
          <span className="text-white font-light">
            Deliver production-ready
          </span>
          <br />
          <span className="text-white font-normal">
            Financial Intelligence
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          The open source financial platform to build AI applications and models with confidence.
        </motion.p>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center space-x-2 mb-8"
        >
          <div className="flex -space-x-2">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
            ))}
          </div>
          <span className="text-slate-300 ml-4">4.9/5 from 50,000+ reviews</span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12"
        >
          <Link
            href="/auth/signup"
            className="group relative px-12 py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold text-lg rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-3">
              <span>Start Making Money Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <button className="group flex items-center space-x-3 text-slate-300 hover:text-white transition-colors">
            <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center group-hover:bg-slate-700/50 transition-colors">
              <Play className="w-6 h-6 ml-1" />
            </div>
            <span className="font-medium">Watch 2-min Demo</span>
          </button>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: currentStat === index ? 1.1 : 1 }}
              transition={{ duration: 0.5 }}
              className={`bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border rounded-2xl p-6 ${
                currentStat === index 
                  ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20' 
                  : 'border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                {React.createElement(stat.icon, { 
                  className: `w-8 h-8 ${currentStat === index ? 'text-emerald-400' : 'text-slate-400'}` 
                })}
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex items-center justify-center space-x-8 mt-12 text-slate-500"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Bank-Grade Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">FDIC Insured</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm">Instant Setup</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-emerald-400 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}

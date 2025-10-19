'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Crown, Sparkles, TrendingUp, Users, DollarSign, Clock } from 'lucide-react'

export default function FinalCTA() {
  const [liveStats, setLiveStats] = useState({
    earnings: 847293,
    signups: 2847,
    online: 12847
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        earnings: prev.earnings + Math.floor(Math.random() * 100) + 50,
        signups: prev.signups + Math.floor(Math.random() * 3) + 1,
        online: prev.online + Math.floor(Math.random() * 20) - 10
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 rounded-2xl p-6 mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-3">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-2xl font-bold text-emerald-400">
                  ${liveStats.earnings.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Earned in last 24h</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Users className="w-6 h-6 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  {liveStats.signups.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">New signups today</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {liveStats.online.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Users online now</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full px-6 py-3 mb-8">
            <Clock className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-semibold">Last Chance - 90% OFF Expires Soon</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Don't Miss Out On
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Life-Changing Money
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Join 150,000+ users already making <span className="text-emerald-400 font-bold">$2,847/month</span> on autopilot.
            <br />
            Your future self will thank you.
          </p>

          {/* Mega CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-12"
          >
            <Link
              href="/auth/signup"
              className="group relative inline-flex items-center space-x-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold text-2xl px-16 py-6 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center space-x-4">
                <Crown className="w-8 h-8" />
                <span>Start Making Money Now</span>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">4.9★</div>
              <div className="text-slate-400 text-sm">50K+ Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">98.7%</div>
              <div className="text-slate-400 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">$2.4B+</div>
              <div className="text-slate-400 text-sm">Assets Protected</div>
            </div>
          </div>

          {/* Risk-Free Guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 max-w-2xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              🛡️ 100% Risk-Free Guarantee
            </h3>
            <p className="text-slate-300 text-lg">
              If you don't make money in your first 30 days, we'll refund every penny. 
              No questions asked. You have nothing to lose and everything to gain.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

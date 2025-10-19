'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, Shield, TrendingUp, Clock, DollarSign, Target, Sparkles } from 'lucide-react'

export default function QuickValue() {
  const benefits = [
    {
      icon: Brain,
      title: "AI Does Everything",
      description: "Our AI analyzes 10,000+ data points per second to make optimal trades",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Works 24/7",
      description: "Never miss opportunities. AI trades while you sleep, work, or vacation",
      color: "from-emerald-500 to-cyan-500"
    },
    {
      icon: DollarSign,
      title: "Guaranteed Profits",
      description: "Average 340% returns or your money back. No questions asked",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "100% Safe",
      description: "Bank-grade security. FDIC insured. Your money is always protected",
      color: "from-blue-500 to-indigo-500"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-full px-6 py-3 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-spin-slow" />
            <span className="text-emerald-400 font-semibold">Why 150,000+ Users Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Set It & Forget It
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            The only investment platform that literally makes money while you do absolutely nothing
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
              <p className="text-slate-400 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-3xl p-12"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            How It Works (Takes 2 Minutes)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create account in 30 seconds" },
              { step: "2", title: "Deposit", desc: "Add money (minimum $100)" },
              { step: "3", title: "Profit", desc: "AI starts making you money" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

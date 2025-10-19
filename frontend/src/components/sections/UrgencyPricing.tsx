'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Crown, CheckCircle, Zap, Clock, ArrowRight, Sparkles, Shield, Star } from 'lucide-react'

export default function UrgencyPricing() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 47,
    seconds: 32
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const plans = [
    {
      name: "Starter",
      price: "$9",
      originalPrice: "$97",
      savings: "90% OFF",
      description: "Perfect for beginners",
      features: [
        "AI Portfolio Management",
        "Basic Market Analysis", 
        "Email Support",
        "Mobile App Access"
      ],
      popular: false,
      color: "from-slate-600 to-slate-700"
    },
    {
      name: "Pro",
      price: "$19", 
      originalPrice: "$197",
      savings: "90% OFF",
      description: "Most popular choice",
      features: [
        "Everything in Starter",
        "Advanced AI Strategies",
        "Expert Chat Support",
        "Priority Execution",
        "Risk Management Tools"
      ],
      popular: true,
      color: "from-emerald-500 to-cyan-500"
    },
    {
      name: "Elite",
      price: "$39",
      originalPrice: "$397", 
      savings: "90% OFF",
      description: "For serious investors",
      features: [
        "Everything in Pro",
        "Personal AI Advisor",
        "1-on-1 Expert Calls",
        "Custom Strategies",
        "White-glove Service"
      ],
      popular: false,
      color: "from-yellow-500 to-orange-500"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="container mx-auto px-6">
        {/* Urgency Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full px-6 py-3 mb-6">
            <Clock className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-red-400 font-semibold">Limited Time Offer</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            90% OFF Ends Soon
          </h2>
          
          {/* Countdown Timer */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-4 min-w-[80px]">
                <div className="text-3xl font-bold text-white">{value.toString().padStart(2, '0')}</div>
                <div className="text-red-100 text-sm uppercase">{unit}</div>
              </div>
            ))}
          </div>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join 150,000+ users making an average of <span className="text-emerald-400 font-bold">$2,847/month</span>
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border rounded-3xl p-8 ${
                plan.popular 
                  ? 'border-emerald-500/50 scale-105 shadow-2xl shadow-emerald-500/20' 
                  : 'border-slate-700/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2">
                    <Crown className="w-4 h-4" />
                    <span>MOST POPULAR</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-slate-500 line-through">{plan.originalPrice}</span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      {plan.savings}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/auth/signup"
                className={`block w-full py-4 rounded-2xl font-bold text-center transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-emerald-500/25 hover:scale-105'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                Start Making Money Now
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-3xl p-8 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h3 className="text-2xl font-bold text-white">100% Money-Back Guarantee</h3>
          </div>
          <p className="text-slate-300 text-lg mb-6">
            If you don't make money in your first 30 days, we'll refund every penny. No questions asked.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>FDIC Insured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Instant Setup</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

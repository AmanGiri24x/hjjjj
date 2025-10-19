'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Users, Award, CheckCircle } from 'lucide-react'

export default function SocialProof() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      avatar: "SC",
      text: "Made $4,200 in my first month. The AI literally works while I sleep!",
      profit: "+$4,200"
    },
    {
      name: "Marcus Johnson",
      role: "Marketing Director", 
      avatar: "MJ",
      text: "Finally, investing that actually makes sense. Up 340% this year.",
      profit: "+340%"
    },
    {
      name: "Emily Rodriguez",
      role: "Teacher",
      avatar: "ER", 
      text: "Started with $500, now at $12K. This changed my life completely.",
      profit: "+2,300%"
    }
  ]

  const companies = [
    "TechCrunch", "Forbes", "Bloomberg", "WSJ", "CNBC"
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
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-2 mb-6">
            <Users className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">150,000+ Active Users</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Real People, Real Results
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Join thousands making life-changing money with our AI
          </p>
        </motion.div>

        {/* Live Stats Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 border border-emerald-500/30 rounded-2xl p-6 mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">$847,293</div>
              <div className="text-sm text-slate-400">Earned in last 24h</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-1">2,847</div>
              <div className="text-sm text-slate-400">New signups today</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">98.7%</div>
              <div className="text-sm text-slate-400">Success rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-1">4.9★</div>
              <div className="text-sm text-slate-400">User rating</div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-slate-400 text-sm">{testimonial.role}</div>
                </div>
                <div className="ml-auto text-emerald-400 font-bold text-lg">
                  {testimonial.profit}
                </div>
              </div>
              <p className="text-slate-300 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center space-x-1">
                {[1,2,3,4,5].map((star) => (
                  <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Press Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-slate-500 mb-8">Featured in</p>
          <div className="flex items-center justify-center space-x-12 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="text-2xl font-bold text-slate-400">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

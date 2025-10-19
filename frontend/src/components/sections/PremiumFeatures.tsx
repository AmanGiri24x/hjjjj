'use client'

import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target, 
  Globe, 
  Sparkles, 
  Crown,
  PieChart,
  BarChart3,
  DollarSign,
  Calendar,
  Bell,
  Eye,
  Lock,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Award,
  Users,
  Clock,
  RefreshCw
} from 'lucide-react'

export default function PremiumFeatures() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeFeature, setActiveFeature] = useState(0)

  const premiumFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced machine learning analyzes your financial patterns and provides personalized recommendations",
      color: "from-emerald-500 to-cyan-500",
      bgColor: "from-emerald-500/10 to-cyan-500/10",
      borderColor: "border-emerald-500/20",
      features: [
        "Predictive spending analysis",
        "Investment opportunity detection",
        "Risk assessment algorithms",
        "Goal optimization strategies"
      ],
      demo: {
        title: "Smart Budget Analysis",
        value: "87% accuracy",
        trend: "+12%",
        insight: "AI detected potential savings of $340/month"
      }
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Live market data and instant portfolio updates keep you informed of every financial movement",
      color: "from-blue-500 to-purple-500",
      bgColor: "from-blue-500/10 to-purple-500/10",
      borderColor: "border-blue-500/20",
      features: [
        "Live market feeds",
        "Real-time portfolio tracking",
        "Instant alert system",
        "Performance benchmarking"
      ],
      demo: {
        title: "Portfolio Performance",
        value: "+15.7%",
        trend: "↗️ Bullish",
        insight: "Outperforming S&P 500 by 3.2%"
      }
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Military-grade encryption and multi-layer security protocols protect your sensitive financial data",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
      borderColor: "border-purple-500/20",
      features: [
        "256-bit AES encryption",
        "Multi-factor authentication",
        "Biometric security",
        "SOC 2 Type II certified"
      ],
      demo: {
        title: "Security Score",
        value: "99.9%",
        trend: "🔒 Secure",
        insight: "Zero security incidents in 2+ years"
      }
    },
    {
      icon: Target,
      title: "Goal Management",
      description: "Set, track, and achieve your financial goals with intelligent milestone tracking and optimization",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-500/10 to-orange-500/10",
      borderColor: "border-yellow-500/20",
      features: [
        "Smart goal setting",
        "Progress visualization",
        "Milestone celebrations",
        "Achievement rewards"
      ],
      demo: {
        title: "Vacation Fund",
        value: "73%",
        trend: "On track",
        insight: "Goal completion by March 2024"
      }
    }
  ]

  const additionalFeatures = [
    {
      icon: Smartphone,
      title: "Mobile Excellence",
      description: "Native iOS and Android apps with offline capabilities"
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Access to 50+ international markets and currencies"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Intelligent notifications for important financial events"
    },
    {
      icon: PieChart,
      title: "Advanced Charts",
      description: "Interactive visualizations and custom dashboards"
    },
    {
      icon: Users,
      title: "Family Sharing",
      description: "Collaborative financial planning for families"
    },
    {
      icon: Award,
      title: "Expert Support",
      description: "24/7 premium support from financial experts"
    }
  ]

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full px-6 py-3 mb-8">
            <Crown className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm tracking-wide">PREMIUM FEATURES</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Luxury Financial
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Experience the pinnacle of financial technology with features designed for 
            the most sophisticated investors and financial enthusiasts.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-6"
          >
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 ${
                  activeFeature === index
                    ? `bg-gradient-to-br ${feature.bgColor} ${feature.borderColor} border-2`
                    : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600/50'
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-xl ${
                    activeFeature === index ? 'shadow-emerald-500/25' : ''
                  } group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${
                      activeFeature === index ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-slate-400">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <div className="sticky top-32">
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                {/* Demo Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${premiumFeatures[activeFeature].color}`}>
                      {React.createElement(premiumFeatures[activeFeature].icon, { className: "w-6 h-6 text-white" })}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {premiumFeatures[activeFeature].title}
                      </h3>
                      <p className="text-slate-400 text-sm">Live Demo</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-sm font-medium">Active</span>
                  </div>
                </div>

                {/* Demo Content */}
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Main Metric */}
                  <div className={`p-6 rounded-2xl bg-gradient-to-br ${premiumFeatures[activeFeature].bgColor} border ${premiumFeatures[activeFeature].borderColor}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-300 font-medium">
                        {premiumFeatures[activeFeature].demo.title}
                      </span>
                      <span className="text-emerald-400 text-sm font-medium">
                        {premiumFeatures[activeFeature].demo.trend}
                      </span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-2">
                      {premiumFeatures[activeFeature].demo.value}
                    </div>
                    <p className="text-slate-400 text-sm">
                      {premiumFeatures[activeFeature].demo.insight}
                    </p>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4">
                    {[
                      { label: "Performance", value: 87 },
                      { label: "Accuracy", value: 94 },
                      { label: "Efficiency", value: 91 }
                    ].map((metric, idx) => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">{metric.label}</span>
                          <span className="text-emerald-400 font-medium">{metric.value}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value}%` }}
                            transition={{ duration: 1, delay: 0.5 + idx * 0.2 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${premiumFeatures[activeFeature].color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <button className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r ${premiumFeatures[activeFeature].color} hover:shadow-xl hover:shadow-emerald-500/25`}>
                    Experience This Feature
                  </button>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Additional Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            And Much More Premium Features
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-2xl hover:border-slate-600/50 hover:from-slate-800/60 hover:to-slate-700/60 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12">
            <Crown className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready for Premium Experience?
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of sophisticated investors who trust DhanAi for their financial intelligence needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
              >
                Start Premium Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-slate-800/50 border border-slate-600/50 text-white font-semibold rounded-2xl hover:bg-slate-700/50 transition-all duration-300"
              >
                View All Features
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

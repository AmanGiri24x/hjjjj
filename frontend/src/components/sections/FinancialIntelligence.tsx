'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Target, 
  Zap,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Sparkles,
  Crown,
  Star,
  Award,
  Shield,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

export default function FinancialIntelligence() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeTab, setActiveTab] = useState(0)

  const intelligenceFeatures = [
    {
      title: "Personal Finance Mastery",
      description: "Complete control over your income, expenses, and savings",
      icon: DollarSign,
      color: "from-emerald-500 to-cyan-500",
      features: [
        {
          icon: TrendingUp,
          title: "Income Tracking",
          description: "Monitor all income sources with automatic categorization",
          value: "$12,450",
          trend: "+8.2%",
          status: "positive"
        },
        {
          icon: PieChart,
          title: "Expense Analysis",
          description: "AI-powered spending insights and optimization suggestions",
          value: "$8,340",
          trend: "-3.1%",
          status: "positive"
        },
        {
          icon: Target,
          title: "Savings Goals",
          description: "Smart goal setting with milestone tracking and rewards",
          value: "73%",
          trend: "On Track",
          status: "neutral"
        }
      ]
    },
    {
      title: "Investment Intelligence",
      description: "Advanced portfolio management and market insights",
      icon: BarChart3,
      color: "from-blue-500 to-purple-500",
      features: [
        {
          icon: Crown,
          title: "Portfolio Optimization",
          description: "AI-driven asset allocation for maximum returns",
          value: "+15.7%",
          trend: "YTD",
          status: "positive"
        },
        {
          icon: Eye,
          title: "Market Analysis",
          description: "Real-time market sentiment and opportunity detection",
          value: "87%",
          trend: "Confidence",
          status: "positive"
        },
        {
          icon: Shield,
          title: "Risk Management",
          description: "Dynamic risk assessment and portfolio protection",
          value: "Low",
          trend: "Optimized",
          status: "neutral"
        }
      ]
    },
    {
      title: "Predictive Analytics",
      description: "Future-focused insights and financial forecasting",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      features: [
        {
          icon: Calendar,
          title: "Cash Flow Forecast",
          description: "Predict future cash flows with 94% accuracy",
          value: "$4,200",
          trend: "Next Month",
          status: "positive"
        },
        {
          icon: AlertTriangle,
          title: "Risk Alerts",
          description: "Early warning system for potential financial risks",
          value: "2",
          trend: "Active",
          status: "warning"
        },
        {
          icon: Star,
          title: "Opportunity Score",
          description: "AI-calculated investment and savings opportunities",
          value: "92/100",
          trend: "Excellent",
          status: "positive"
        }
      ]
    }
  ]

  const metrics = [
    { label: "Users Served", value: "150K+", icon: Crown },
    { label: "Assets Managed", value: "$2.4B+", icon: DollarSign },
    { label: "AI Accuracy", value: "99.2%", icon: Brain },
    { label: "Uptime", value: "99.9%", icon: Shield }
  ]

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.1),transparent_50%)]" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full px-6 py-3 mb-8">
            <Brain className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm tracking-wide">FINANCIAL INTELLIGENCE</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Clarity & Control
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Over Your Finances
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            DhanAi brings unprecedented clarity to your financial life with intelligent tracking, 
            deep insights, and personalized recommendations that help you make better money decisions.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-16"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-2">
            <div className="flex space-x-2">
              {intelligenceFeatures.map((feature, index) => (
                <button
                  key={feature.title}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === index
                      ? `bg-gradient-to-r ${feature.color} text-white shadow-xl`
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <feature.icon className="w-5 h-5" />
                  <span className="hidden sm:block">{feature.title}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Active Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              {intelligenceFeatures[activeTab].title}
            </h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              {intelligenceFeatures[activeTab].description}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {intelligenceFeatures[activeTab].features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 transition-all duration-300 h-full">
                  {/* Feature Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${intelligenceFeatures[activeTab].color} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Feature Content */}
                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Current Value</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-white">{feature.value}</span>
                        {feature.status === 'positive' && (
                          <ArrowUpRight className="w-5 h-5 text-green-400" />
                        )}
                        {feature.status === 'warning' && (
                          <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        )}
                        {feature.status === 'neutral' && (
                          <Info className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Status</span>
                      <span className={`text-sm font-medium ${
                        feature.status === 'positive' ? 'text-green-400' :
                        feature.status === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {feature.trend}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: feature.status === 'positive' ? '85%' : feature.status === 'warning' ? '60%' : '75%' }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          feature.status === 'positive' ? 'from-green-500 to-emerald-500' :
                          feature.status === 'warning' ? 'from-yellow-500 to-orange-500' :
                          'from-blue-500 to-cyan-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Trusted by Financial Professionals
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <metric.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                  <div className="text-slate-400 font-medium">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Financial Life?
            </h3>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Join thousands of users who have gained clarity and control over their finances with DhanAi's 
              intelligent co-pilot. Start your journey to financial freedom today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                Start Your Free Trial
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-slate-800/50 border border-slate-600/50 text-white font-semibold rounded-2xl hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 mt-12 text-slate-400">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium">Award Winning</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium">Bank-Grade Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

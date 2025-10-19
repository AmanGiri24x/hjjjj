'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Target, 
  Zap,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Eye,
  Sparkles,
  Clock,
  Globe,
  Mic,
  Send,
  Shield,
  Bell,
  Star,
  CheckCircle
} from 'lucide-react'

export default function IntelligentCoPilot() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeDemo, setActiveDemo] = useState(0)
  const [chatMessage, setChatMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const demoScenarios = [
    {
      title: "Smart Expense Analysis",
      description: "AI automatically categorizes and analyzes your spending patterns",
      icon: PieChart,
      color: "from-emerald-500 to-cyan-500",
      messages: [
        { type: 'user', text: "How much did I spend on dining this month?" },
        { type: 'ai', text: "You spent $847 on dining this month, which is 23% higher than last month. I notice you've been ordering takeout more frequently on weekends. Would you like me to suggest some budget-friendly meal planning strategies?" }
      ]
    },
    {
      title: "Investment Recommendations",
      description: "Personalized investment advice based on your financial goals",
      icon: TrendingUp,
      color: "from-blue-500 to-purple-500",
      messages: [
        { type: 'user', text: "Should I invest more in tech stocks?" },
        { type: 'ai', text: "Based on your current portfolio allocation, you're already 35% invested in tech. Given market volatility, I recommend diversifying into healthcare and renewable energy sectors. Your risk profile suggests a 60/40 split would be optimal." }
      ]
    },
    {
      title: "Goal Tracking",
      description: "Monitor progress and get actionable insights for your financial goals",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      messages: [
        { type: 'user', text: "How close am I to my vacation savings goal?" },
        { type: 'ai', text: "You're 73% of the way to your $5,000 vacation goal! At your current savings rate of $420/month, you'll reach it by March 2024. I can help you save an extra $50/month by optimizing your subscriptions." }
      ]
    }
  ]

  const features = [
    {
      icon: Brain,
      title: "Advanced AI Analysis",
      description: "Deep learning algorithms analyze your financial patterns and provide personalized insights",
      color: "from-emerald-400 to-cyan-400"
    },
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description: "Ask questions in plain English and get detailed, actionable financial advice",
      color: "from-blue-400 to-purple-400"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your financial data is encrypted and never shared. AI processing happens securely",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Zap,
      title: "Real-Time Insights",
      description: "Get instant analysis and recommendations as your financial situation changes",
      color: "from-yellow-400 to-orange-400"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoScenarios.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [demoScenarios.length])

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    setIsTyping(true)
    setChatMessage('')
    
    setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)] opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)] opacity-60" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full px-6 py-3 mb-8">
            <Brain className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm tracking-wide">AI-POWERED INTELLIGENCE</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Meet Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Financial Co-Pilot
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            DhanAi understands your financial goals and provides intelligent, personalized guidance 
            to help you make better money decisions every day.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column - Interactive Demo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            {/* Chat Interface */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b border-slate-700/50 p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">DhanAi Assistant</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-sm">Online & Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Tabs */}
              <div className="flex border-b border-slate-700/50">
                {demoScenarios.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveDemo(index)}
                    className={`flex-1 p-4 text-sm font-medium transition-all duration-300 ${
                      activeDemo === index
                        ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <scenario.icon className="w-4 h-4 mx-auto mb-1" />
                    <div className="truncate">{scenario.title}</div>
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="p-6 h-80 overflow-y-auto space-y-4">
                {demoScenarios[activeDemo].messages.map((message, index) => (
                  <motion.div
                    key={`${activeDemo}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-sm p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white ml-8'
                        : 'bg-slate-800/50 text-slate-200 mr-8'
                    }`}>
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400 text-xs font-medium">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-800/50 text-slate-200 p-4 rounded-2xl mr-8">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-emerald-400" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-700/50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your finances..."
                      className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="p-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-emerald-500/25"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl p-4 shadow-xl shadow-emerald-500/25"
            >
              <div className="text-white text-center">
                <div className="text-2xl font-bold">99.2%</div>
                <div className="text-xs opacity-90">Accuracy</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-4 shadow-xl shadow-blue-500/25"
            >
              <div className="text-white text-center">
                <div className="text-2xl font-bold">&lt;1s</div>
                <div className="text-xs opacity-90">Response</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-white mb-6">
                Intelligent Financial Guidance
              </h3>
              <p className="text-lg text-slate-300 leading-relaxed">
                Our AI co-pilot learns from your financial behavior and provides personalized 
                recommendations to help you achieve your goals faster and smarter.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="group p-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-2xl hover:border-slate-600/50 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-slate-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
              className="pt-8"
            >
              <button className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40">
                <span>Experience AI Intelligence</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
        >
          {[
            { value: "10M+", label: "Conversations", icon: MessageSquare },
            { value: "99.2%", label: "Accuracy Rate", icon: Target },
            { value: "24/7", label: "Availability", icon: Clock },
            { value: "150+", label: "Languages", icon: Globe }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
              className="group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                <stat.icon className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

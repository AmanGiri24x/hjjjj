'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Sparkles, 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Award,
  TrendingUp,
  Users,
  Mail,
  ArrowRight,
  CheckCircle,
  Gift,
  Calendar,
  Bell,
  Lock,
  Gem,
  Heart,
  Target,
  Rocket
} from 'lucide-react'

export default function ExclusiveAccess() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const exclusiveFeatures = [
    {
      icon: Crown,
      title: "VIP Early Access",
      description: "Be among the first to experience revolutionary features before public release",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Gem,
      title: "Exclusive Insights",
      description: "Access to premium market research and personalized wealth-building strategies",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Elite Community",
      description: "Join a private network of high-net-worth individuals and financial experts",
      color: "from-emerald-500 to-cyan-500"
    },
    {
      icon: Gift,
      title: "Founder's Perks",
      description: "Lifetime discounts, exclusive events, and direct access to our founding team",
      color: "from-blue-500 to-indigo-500"
    }
  ]

  const waitlistBenefits = [
    "Priority access to new features",
    "Exclusive webinars with financial experts",
    "Early bird pricing on premium plans",
    "Direct feedback channel to product team",
    "Invitation to beta testing programs",
    "Access to private Discord community"
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // Here you would typically send the email to your backend
      console.log('Email submitted:', email)
    }
  }

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.15),transparent_50%)]" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1.1, 1, 1.1]
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold text-sm tracking-wide">EXCLUSIVE ACCESS</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Join the Elite
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
              Financial Circle
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Get exclusive access to DhanAi's most advanced features, connect with financial experts, 
            and be part of an elite community reshaping the future of personal wealth management.
          </p>
        </motion.div>

        {/* Exclusive Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {exclusiveFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative"
            >
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-slate-600/50 transition-all duration-500 h-full group-hover:transform group-hover:scale-105">
                {/* Feature Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Feature Content */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25"
                >
                  <Star className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-emerald-500/5" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500" />
            
            <div className="relative z-10">
              {!isSubmitted ? (
                <>
                  <div className="text-center mb-12">
                    <Crown className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                    <h3 className="text-4xl font-bold text-white mb-6">
                      Ready to Transform Your Wealth?
                    </h3>
                    <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                      Join thousands of forward-thinking individuals who are already using DhanAi 
                      to build extraordinary wealth. Your financial future starts here.
                    </p>
                  </div>

                  {/* Email Signup Form */}
                  <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 whitespace-nowrap"
                      >
                        Get Exclusive Access
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                      </motion.button>
                    </div>
                  </form>

                  {/* Waitlist Benefits */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {waitlistBenefits.map((benefit, index) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300 font-medium">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-4xl font-bold text-white mb-6">
                    Welcome to the Elite Circle!
                  </h3>
                  <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
                    Thank you for joining DhanAi's exclusive community. You'll receive priority access 
                    to new features and exclusive insights directly in your inbox.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                    >
                      Join Discord Community
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-3 bg-slate-800/50 border border-slate-600/50 text-white font-semibold rounded-xl hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
                    >
                      Follow on Twitter
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-16"
        >
          <div className="flex items-center justify-center space-x-8 text-slate-400">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium">10,000+ Elite Members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">4.9/5 Satisfaction</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">Bank-Grade Security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

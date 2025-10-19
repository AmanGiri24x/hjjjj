'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Star, 
  Shield, 
  Zap, 
  Crown,
  CreditCard,
  Lock,
  Users,
  BarChart3,
  Bot,
  Headphones,
  Globe
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  description: string
  features: string[]
  popular?: boolean
  stripePriceId: string
  icon: any
  color: string
}

export default function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      description: 'Perfect for individuals starting their financial journey',
      features: [
        'Basic financial tracking',
        'Monthly reports',
        'Email support',
        'Up to 3 accounts',
        'Budget management',
        'Goal tracking',
        'Mobile app access'
      ],
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_basic',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      currency: 'USD',
      interval: 'month',
      description: 'Advanced features for serious financial planning',
      features: [
        'Everything in Basic',
        'Advanced financial analytics',
        'Real-time insights',
        'Priority support',
        'Unlimited accounts',
        'AI-powered recommendations',
        'Custom budgets and goals',
        'Investment tracking',
        'Tax optimization',
        'Portfolio analysis'
      ],
      popular: true,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      currency: 'USD',
      interval: 'month',
      description: 'Complete solution for businesses and power users',
      features: [
        'Everything in Premium',
        'White-label solution',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        'Multi-user management',
        'Custom reporting',
        'Compliance tools',
        'Priority phone support'
      ],
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
      icon: Crown,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId)
    setIsProcessing(true)

    try {
      // This would integrate with your payment processing
      console.log('Selected plan:', planId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to checkout or show payment form
      // window.location.href = `/checkout?plan=${planId}`
      
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('AI') || feature.includes('recommendations')) return <Bot className="w-4 h-4" />
    if (feature.includes('support')) return <Headphones className="w-4 h-4" />
    if (feature.includes('security')) return <Lock className="w-4 h-4" />
    if (feature.includes('analytics') || feature.includes('reports')) return <BarChart3 className="w-4 h-4" />
    if (feature.includes('API') || feature.includes('integrations')) return <Globe className="w-4 h-4" />
    if (feature.includes('user') || feature.includes('management')) return <Users className="w-4 h-4" />
    return <Check className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <CreditCard className="w-4 h-4" />
            <span>Flexible Pricing Plans</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Choose Your
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Financial </span>
            Plan
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-3xl mx-auto"
          >
            Unlock the power of AI-driven financial intelligence with plans designed for every stage of your journey
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 hover:scale-105 ${
                  plan.popular 
                    ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20' 
                    : 'border-slate-700/50 hover:border-slate-600/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center space-x-1 mb-2">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400">/{plan.interval}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-5 h-5 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getFeatureIcon(feature)}
                      </div>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing && selectedPlan === plan.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
                      : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                  } ${isProcessing && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    `Get Started with ${plan.name}`
                  )}
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">All Plans Include</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Bank-Grade Security</h4>
              <p className="text-slate-400 text-sm">256-bit encryption, secure data handling, and compliance with financial regulations</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Real-Time Analytics</h4>
              <p className="text-slate-400 text-sm">Live financial data, instant insights, and automated categorization</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">AI-Powered Insights</h4>
              <p className="text-slate-400 text-sm">Smart recommendations, predictive analytics, and personalized advice</p>
            </div>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-full">
            <Shield className="w-5 h-5" />
            <span className="font-medium">30-day money-back guarantee • Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

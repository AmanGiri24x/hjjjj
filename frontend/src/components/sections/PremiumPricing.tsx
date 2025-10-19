'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Sparkles,
  TrendingUp,
  Users,
  Infinity,
  Award,
  Diamond,
  Gem,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function PremiumPricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)

  const pricingPlans = [
    {
      name: "Essential",
      description: "Perfect for individuals starting their financial journey",
      icon: Star,
      color: "from-slate-600 to-slate-700",
      borderColor: "border-slate-600/50",
      popular: false,
      monthlyPrice: 29,
      yearlyPrice: 290,
      savings: "Save $58",
      features: [
        "Personal finance tracking",
        "Basic AI insights",
        "Expense categorization",
        "Monthly reports",
        "Mobile app access",
        "Email support",
        "Data export",
        "Basic security"
      ],
      limitations: [
        "Up to 3 bank accounts",
        "Standard support",
        "Basic analytics"
      ]
    },
    {
      name: "Professional",
      description: "Advanced features for serious wealth builders",
      icon: Crown,
      color: "from-emerald-500 to-cyan-500",
      borderColor: "border-emerald-500/50",
      popular: true,
      monthlyPrice: 79,
      yearlyPrice: 790,
      savings: "Save $158",
      features: [
        "Everything in Essential",
        "Advanced AI co-pilot",
        "Investment tracking",
        "Tax optimization",
        "Goal-based planning",
        "Real-time alerts",
        "Portfolio analysis",
        "Priority support",
        "Custom categories",
        "Advanced reporting",
        "API access",
        "Multi-currency support"
      ],
      limitations: [
        "Up to 10 bank accounts",
        "Standard integrations"
      ]
    },
    {
      name: "Elite",
      description: "Ultimate financial intelligence for high-net-worth individuals",
      icon: Diamond,
      color: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500/50",
      popular: false,
      monthlyPrice: 199,
      yearlyPrice: 1990,
      savings: "Save $398",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom AI models",
        "White-glove onboarding",
        "Advanced tax strategies",
        "Estate planning tools",
        "Private wealth insights",
        "Concierge support",
        "Custom integrations",
        "Unlimited accounts",
        "Family sharing",
        "Regulatory compliance",
        "Advanced security",
        "Custom reporting"
      ],
      limitations: []
    }
  ]

  const enterpriseFeatures = [
    { icon: Shield, title: "Enterprise Security", description: "SOC 2 Type II compliance" },
    { icon: Users, title: "Team Management", description: "Multi-user access controls" },
    { icon: Zap, title: "Custom Integrations", description: "Tailored API connections" },
    { icon: Award, title: "SLA Guarantee", description: "99.9% uptime commitment" }
  ]

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.1),transparent_50%)]" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/20 rounded-full px-6 py-3 mb-8">
            <Crown className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm tracking-wide">PREMIUM PLANS</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Financial Future
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-12">
            Unlock the full potential of AI-powered financial intelligence with plans designed 
            for every stage of your wealth-building journey.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg font-medium transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-slate-700 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <motion.div
                animate={{ x: billingCycle === 'yearly' ? 32 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-lg"
              />
            </button>
            <span className={`text-lg font-medium transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-full px-3 py-1"
              >
                <span className="text-emerald-400 text-sm font-bold">Save up to 20%</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative group ${plan.popular ? 'lg:scale-110 lg:-mt-8' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl">
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border ${plan.borderColor} rounded-3xl p-8 h-full transition-all duration-500 ${
                hoveredPlan === index ? 'transform scale-105 shadow-2xl shadow-emerald-500/10' : ''
              } ${plan.popular ? 'border-emerald-500/50 shadow-xl shadow-emerald-500/20' : ''}`}>
                
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${plan.color} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-300 leading-relaxed">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-5xl font-bold text-white">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-slate-400 font-medium">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-emerald-400 text-sm font-medium mt-2">
                      {plan.savings}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.2 + idx * 0.05 }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium">{feature}</span>
                    </motion.div>
                  ))}
                  
                  {plan.limitations.map((limitation, idx) => (
                    <div key={limitation} className="flex items-center space-x-3 opacity-60">
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-500 rounded-full" />
                      </div>
                      <span className="text-slate-400 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40'
                      : 'bg-slate-800/50 border border-slate-600/50 text-white hover:bg-slate-700/50 hover:border-slate-500/50'
                  }`}
                >
                  {plan.name === 'Elite' ? 'Contact Sales' : 'Start Free Trial'}
                </motion.button>

                {/* Money Back Guarantee */}
                <div className="text-center mt-4">
                  <span className="text-slate-400 text-sm">30-day money-back guarantee</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enterprise Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <Gem className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-4xl font-bold text-white mb-4">
                Enterprise Solutions
              </h3>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Custom solutions for large organizations, financial institutions, and enterprise clients
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {enterpriseFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-slate-300 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              >
                Contact Enterprise Sales
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <h3 className="text-3xl font-bold text-white mb-8">
            Questions? We're Here to Help
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-slate-800/50 border border-slate-600/50 text-white font-semibold rounded-xl hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
            >
              View FAQ
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              Talk to Sales
            </motion.button>
          </div>

          <p className="text-slate-400 text-sm">
            All plans include a 30-day free trial. No credit card required to start.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

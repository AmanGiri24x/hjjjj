'use client'

import { motion } from 'framer-motion'
import { Brain, TrendingUp, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analytics',
    description: 'Advanced machine learning models analyze market patterns and predict trends with 95% accuracy.',
    benefits: ['Real-time market analysis', 'Predictive modeling', 'Risk assessment']
  },
  {
    icon: TrendingUp,
    title: 'Portfolio Optimization',
    description: 'Intelligent algorithms automatically rebalance your portfolio for maximum returns and minimal risk.',
    benefits: ['Automated rebalancing', 'Risk-adjusted returns', 'Tax optimization']
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Comprehensive risk analysis and mitigation strategies to protect your investments.',
    benefits: ['Stress testing', 'Scenario analysis', 'Compliance monitoring']
  }
]

export default function FinanceAI() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Brain className="w-4 h-4" />
              <span>Finance AI</span>
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Ship high-quality{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI insights
            </span>
            , fast
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            Leverage cutting-edge artificial intelligence to make smarter financial decisions. 
            Our AI models process millions of data points to deliver actionable insights.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              </div>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center space-x-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Ready to experience AI-powered finance?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of investors who trust our AI to optimize their portfolios and maximize returns.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
              <span>Start free trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="text-blue-600 hover:text-blue-700 font-semibold px-8 py-4 transition-colors duration-200">
              Learn more about AI features
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

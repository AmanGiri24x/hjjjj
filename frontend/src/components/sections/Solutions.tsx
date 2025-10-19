'use client'

import { motion } from 'framer-motion'
import { Building2, Users, Briefcase, ArrowRight, CheckCircle } from 'lucide-react'

const solutions = [
  {
    icon: Building2,
    title: 'Enterprise',
    description: 'Complete financial analytics platform for large organizations',
    features: [
      'Multi-tenant architecture',
      'Advanced security & compliance',
      'Custom integrations',
      'Dedicated support'
    ],
    price: 'Custom pricing',
    popular: false
  },
  {
    icon: Users,
    title: 'Team',
    description: 'Collaborative tools for investment teams and fund managers',
    features: [
      'Team collaboration',
      'Shared portfolios',
      'Role-based access',
      'API access'
    ],
    price: '$99/month',
    popular: true
  },
  {
    icon: Briefcase,
    title: 'Individual',
    description: 'Personal investment management and portfolio tracking',
    features: [
      'Portfolio tracking',
      'Basic analytics',
      'Mobile app',
      'Email support'
    ],
    price: '$29/month',
    popular: false
  }
]

export default function Solutions() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Solutions for every{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              financial need
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            From individual investors to enterprise organizations, we have the right solution 
            to power your financial analytics and trading operations.
          </motion.p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg ${
                solution.popular 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {solution.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  solution.popular ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <solution.icon className={`w-8 h-8 ${
                    solution.popular ? 'text-blue-600' : 'text-slate-600'
                  }`} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{solution.title}</h3>
                <p className="text-slate-600 mb-4">{solution.description}</p>
                
                <div className="text-3xl font-bold text-slate-900 mb-6">
                  {solution.price}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {solution.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                solution.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}>
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-slate-50 rounded-2xl p-8 lg:p-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Need a custom solution?
          </h3>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Our enterprise team can work with you to build a tailored financial analytics 
            platform that meets your specific requirements.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
              <span>Contact sales</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="text-slate-600 hover:text-slate-900 font-semibold px-8 py-4 transition-colors duration-200">
              Schedule a demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

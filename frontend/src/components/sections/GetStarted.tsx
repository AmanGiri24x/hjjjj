'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Github, BookOpen, Users, ExternalLink } from 'lucide-react'

const resources = [
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Read comprehensive guides and API references',
    link: '/docs',
    external: false
  },
  {
    icon: Github,
    title: 'GitHub',
    description: '20k+ stars on our open-source repository',
    link: 'https://github.com/dhanaillytics/platform',
    external: true
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join 50k+ developers in our community',
    link: '/community',
    external: false
  }
]

export default function GetStarted() {
  return (
    <section className="py-20 lg:py-32 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Get started with{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              DhanAillytics
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto mb-12"
          >
            Choose your deployment option and start building powerful financial analytics 
            applications in minutes.
          </motion.p>
        </div>

        {/* Deployment Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Self-hosted */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-8"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Self-hosted Open Source</h3>
              <p className="text-slate-300">
                Deploy DhanAillytics on your own infrastructure with full control and customization.
              </p>
            </div>
            
            <div className="bg-slate-900 rounded-lg p-4 mb-6 font-mono text-sm">
              <div className="text-green-400">$ pip install dhanaillytics</div>
              <div className="text-slate-400"># Start the server</div>
              <div className="text-blue-400">$ dhanaillytics server</div>
            </div>
            
            <button className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2">
              <span>Get started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Managed hosting */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Managed hosting</h3>
                <p className="text-blue-100">
                  Fully managed DhanAillytics with enterprise features, security, and support.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span>99.9% uptime SLA</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span>Enterprise security</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span>24/7 support</span>
                </div>
              </div>
              
              <button className="w-full bg-white hover:bg-blue-50 text-blue-600 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2">
                <span>Get started for free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          </motion.div>
        </div>

        {/* Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.link}
              target={resource.external ? '_blank' : '_self'}
              rel={resource.external ? 'noopener noreferrer' : ''}
              className="group bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition-all duration-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-slate-700 group-hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                  <resource.icon className="w-5 h-5 text-slate-300" />
                </div>
                <h4 className="font-semibold text-white">{resource.title}</h4>
                {resource.external && (
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors duration-200" />
                )}
              </div>
              <p className="text-slate-300 group-hover:text-slate-200 transition-colors duration-200">
                {resource.description}
              </p>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

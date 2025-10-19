'use client'

import { motion } from 'framer-motion'
import { 
  Brain, 
  Zap, 
  Shield, 
  Target, 
  Users, 
  Rocket, 
  Globe, 
  Award,
  TrendingUp,
  Eye,
  Heart,
  Lightbulb
} from 'lucide-react'

const teamMembers = [
  {
    name: "AI Neural Engine",
    role: "Core Intelligence",
    description: "Advanced machine learning algorithms powering real-time financial insights",
    icon: Brain,
    color: "from-purple-500 to-violet-600"
  },
  {
    name: "Quantum Analytics",
    role: "Data Processing",
    description: "Lightning-fast data analysis with quantum-inspired computing principles",
    icon: Zap,
    color: "from-blue-500 to-cyan-600"
  },
  {
    name: "Security Matrix",
    role: "Protection Layer",
    description: "Military-grade encryption and privacy-preserving technologies",
    icon: Shield,
    color: "from-green-500 to-emerald-600"
  },
  {
    name: "Vision System",
    role: "3D Visualization",
    description: "Immersive 3D environments for intuitive financial data exploration",
    icon: Eye,
    color: "from-pink-500 to-rose-600"
  }
]

const values = [
  {
    title: "Innovation First",
    description: "Pushing the boundaries of fintech with cutting-edge AI and 3D technologies",
    icon: Lightbulb,
    color: "from-yellow-500 to-orange-600"
  },
  {
    title: "User-Centric Design",
    description: "Every feature designed with user experience and accessibility at its core",
    icon: Heart,
    color: "from-red-500 to-pink-600"
  },
  {
    title: "Data Security",
    description: "Uncompromising commitment to protecting your financial data and privacy",
    icon: Shield,
    color: "from-green-500 to-teal-600"
  },
  {
    title: "Continuous Growth",
    description: "Constantly evolving platform with regular updates and new capabilities",
    icon: TrendingUp,
    color: "from-blue-500 to-indigo-600"
  }
]

const stats = [
  { number: "2024", label: "Founded", icon: Rocket },
  { number: "50K+", label: "AI Models Trained", icon: Brain },
  { number: "99.9%", label: "Uptime Guarantee", icon: Target },
  { number: "24/7", label: "Real-time Analysis", icon: Globe }
]

export default function AboutUs() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Space-themed overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About DhanAillytics
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Pioneering the future of financial intelligence through AI-powered analytics, 
            immersive 3D visualizations, and cutting-edge research in fintech innovation.
          </motion.p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-3xl p-8 mb-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center neon-primary">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
              Our Mission
            </h3>
            <p className="text-lg text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
              To democratize advanced financial analytics by making sophisticated AI tools accessible to everyone. 
              We believe that powerful financial insights shouldn't be limited to Wall Street giants – 
              every investor deserves access to institutional-grade analytics powered by artificial intelligence.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="glass rounded-2xl p-6 text-center hover:neon-blue transition-all duration-300 hover-lift group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="glass rounded-2xl p-6 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{value.title}</h4>
                  <p className="text-gray-300 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Powered by Advanced Technology
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="glass rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${member.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <member.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{member.name}</h4>
                  <p className="text-primary-400 text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Future Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="glass rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-500/10 via-primary-500/10 to-accent-500/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center neon-accent">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              The Future of Finance is Here
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
              We're not just building another financial platform – we're creating the foundation for the next generation 
              of financial intelligence. With ongoing research in quantum computing, federated learning, and explainable AI, 
              DhanAillytics is at the forefront of fintech innovation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-primary-500/20 text-primary-400 px-4 py-2 rounded-full text-sm font-medium">
                Quantum Computing
              </span>
              <span className="bg-accent-500/20 text-accent-400 px-4 py-2 rounded-full text-sm font-medium">
                Federated Learning
              </span>
              <span className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium">
                Explainable AI
              </span>
              <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                Privacy-Preserving ML
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

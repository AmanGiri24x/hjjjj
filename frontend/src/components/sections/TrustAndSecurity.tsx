'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Eye, 
  Award, 
  CheckCircle, 
  Star,
  Globe,
  Users,
  Zap,
  Crown,
  Fingerprint,
  Key,
  Server,
  AlertTriangle,
  FileCheck,
  Building,
  Smartphone,
  Clock
} from 'lucide-react'

export default function TrustAndSecurity() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const securityFeatures = [
    {
      icon: Shield,
      title: "Bank-Grade Encryption",
      description: "256-bit AES encryption protects all your financial data with military-grade security standards",
      color: "from-emerald-500 to-cyan-500",
      features: ["End-to-end encryption", "Zero-knowledge architecture", "Secure data transmission", "Regular security audits"]
    },
    {
      icon: Fingerprint,
      title: "Biometric Authentication",
      description: "Advanced biometric security including fingerprint, face ID, and voice recognition for ultimate protection",
      color: "from-blue-500 to-purple-500",
      features: ["Multi-factor authentication", "Biometric login", "Device fingerprinting", "Session management"]
    },
    {
      icon: Eye,
      title: "Privacy First",
      description: "Your data is never sold or shared. Complete transparency in how we handle your financial information",
      color: "from-purple-500 to-pink-500",
      features: ["GDPR compliant", "Data anonymization", "User consent controls", "Privacy dashboard"]
    },
    {
      icon: Server,
      title: "Infrastructure Security",
      description: "Enterprise-grade infrastructure with 99.9% uptime and distributed security across multiple data centers",
      color: "from-yellow-500 to-orange-500",
      features: ["SOC 2 Type II", "ISO 27001 certified", "24/7 monitoring", "Disaster recovery"]
    }
  ]

  const certifications = [
    {
      icon: Award,
      title: "SOC 2 Type II",
      description: "Certified for security, availability, and confidentiality",
      badge: "CERTIFIED"
    },
    {
      icon: Shield,
      title: "ISO 27001",
      description: "International security management standard compliance",
      badge: "COMPLIANT"
    },
    {
      icon: FileCheck,
      title: "GDPR Ready",
      description: "Full compliance with European data protection regulations",
      badge: "COMPLIANT"
    },
    {
      icon: Building,
      title: "PCI DSS",
      description: "Payment card industry data security standards certified",
      badge: "LEVEL 1"
    }
  ]

  const trustMetrics = [
    { value: "99.9%", label: "Uptime Guarantee", icon: Clock },
    { value: "256-bit", label: "AES Encryption", icon: Lock },
    { value: "0", label: "Data Breaches", icon: Shield },
    { value: "24/7", label: "Security Monitoring", icon: Eye }
  ]

  const securityLayers = [
    { name: "Application Layer", status: "Secured", color: "emerald" },
    { name: "API Gateway", status: "Protected", color: "cyan" },
    { name: "Database Layer", status: "Encrypted", color: "blue" },
    { name: "Infrastructure", status: "Monitored", color: "purple" }
  ]

  return (
    <section ref={ref} className="py-32 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full px-6 py-3 mb-8">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-sm tracking-wide">TRUST & SECURITY</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Your Financial Data
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Fortress Protected
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            DhanAi employs enterprise-grade security measures and industry-leading compliance standards 
            to ensure your financial information remains completely secure and private.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative"
            >
              <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-slate-600/50 transition-all duration-500 h-full ${
                hoveredCard === index ? 'transform scale-105 shadow-2xl shadow-emerald-500/10' : ''
              }`}>
                {/* Feature Header */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-3">
                  {feature.features.map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.2 + idx * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300 font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Security Status */}
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Security Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">Active & Monitored</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Security Badge */}
              <motion.div
                animate={{ rotate: hoveredCard === index ? 360 : 0 }}
                transition={{ duration: 0.8 }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/25"
              >
                <Lock className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Security Layers Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Multi-Layer Security Architecture
            </h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Your data is protected by multiple independent security layers, each providing additional protection
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Security Layers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityLayers.map((layer, index) => (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  className="relative"
                >
                  <div className={`bg-gradient-to-br from-${layer.color}-500/10 to-${layer.color}-600/10 border border-${layer.color}-500/20 rounded-2xl p-6 text-center hover:from-${layer.color}-500/20 hover:to-${layer.color}-600/20 transition-all duration-300`}>
                    <div className={`w-12 h-12 bg-gradient-to-br from-${layer.color}-500 to-${layer.color}-600 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2">{layer.name}</h4>
                    <div className={`inline-flex items-center space-x-1 text-${layer.color}-400 text-sm font-medium`}>
                      <CheckCircle className="w-4 h-4" />
                      <span>{layer.status}</span>
                    </div>
                  </div>
                  
                  {/* Connection Lines */}
                  {index < securityLayers.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-emerald-500/50 to-cyan-500/50" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Industry Certifications & Compliance
            </h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              We maintain the highest industry standards and certifications for your peace of mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                className="group bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <cert.icon className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {cert.title}
                </h4>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  {cert.description}
                </p>
                <div className="inline-flex items-center justify-center px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
                  {cert.badge}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="mb-16"
        >
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <Crown className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-4">
                Security You Can Trust
              </h3>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Our commitment to security is reflected in our track record and industry-leading metrics
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {trustMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <metric.icon className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
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
          transition={{ duration: 0.8, delay: 2 }}
          className="text-center"
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold text-white mb-6">
              Your Security is Our Priority
            </h3>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Experience the peace of mind that comes with enterprise-grade security. 
              Your financial data deserves the highest level of protection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                Start Secure Trial
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-slate-800/50 border border-slate-600/50 text-white font-semibold rounded-2xl hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
              >
                Security Whitepaper
              </motion.button>
            </div>

            {/* Security Promise */}
            <div className="mt-12 p-6 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-lg">Security Promise</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                We guarantee the highest level of security for your financial data. If we ever experience a security 
                incident affecting your account, we'll notify you immediately and provide full transparency about the situation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

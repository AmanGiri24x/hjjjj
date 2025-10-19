'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Shield, 
  Network, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  Eye,
  Zap,
  BarChart3,
  Lock
} from 'lucide-react'
import CreditScoringForm from '@/components/ai/CreditScoringForm'
import CreditScoringResults from '@/components/ai/CreditScoringResults'
import PrivacyMetrics from '@/components/ai/PrivacyMetrics'
import SystemHealth from '@/components/ai/SystemHealth'

interface CreditAssessment {
  applicantId: string
  creditScore: number
  confidence: number
  riskLevel: string
  explanation: {
    local: string
    global: string
    nodeImportance: Record<string, number>
    edgeImportance: Record<string, number>
    featureImportance: Record<string, number>
  }
  timestamp: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1
  }
}

export default function CreditScoringPage() {
  const [activeTab, setActiveTab] = useState<'assess' | 'results' | 'privacy' | 'health'>('assess')
  const [assessmentResults, setAssessmentResults] = useState<CreditAssessment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const tabs = [
    { id: 'assess', label: 'Credit Assessment', icon: Brain },
    { id: 'results', label: 'Results & Analytics', icon: BarChart3 },
    { id: 'privacy', label: 'Privacy Metrics', icon: Shield },
    { id: 'health', label: 'System Health', icon: Network }
  ]

  const handleAssessmentComplete = (result: CreditAssessment) => {
    setAssessmentResults(prev => [result, ...prev])
    setActiveTab('results')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 cyber-grid">
      <div className="min-h-screen relative">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent-900/20 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="relative z-10 p-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header */}
            <motion.div variants={cardVariants} className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center neon-blue">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
                  Federated Graph Credit Scoring
                </h1>
              </div>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Advanced AI-powered credit risk assessment using federated graph neural networks with explainable AI and privacy-preserving technology
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Network, title: 'Graph Neural Networks', desc: 'Advanced network analysis', color: 'from-blue-500 to-cyan-500' },
                { icon: Shield, title: 'Privacy Preserving', desc: 'Differential privacy protection', color: 'from-green-500 to-emerald-500' },
                { icon: Eye, title: 'Explainable AI', desc: 'Transparent decision making', color: 'from-purple-500 to-pink-500' },
                { icon: Users, title: 'Federated Learning', desc: 'Collaborative ML training', color: 'from-orange-500 to-red-500' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  className="glass rounded-xl p-6 hover-lift group"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:neon-blue transition-all duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Tab Navigation */}
            <motion.div variants={cardVariants} className="glass rounded-xl p-2">
              <div className="flex space-x-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white neon-blue'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-xl p-8"
              >
                {activeTab === 'assess' && (
                  <CreditScoringForm 
                    onAssessmentComplete={handleAssessmentComplete}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                  />
                )}
                
                {activeTab === 'results' && (
                  <CreditScoringResults 
                    results={assessmentResults}
                  />
                )}
                
                {activeTab === 'privacy' && (
                  <PrivacyMetrics />
                )}
                
                {activeTab === 'health' && (
                  <SystemHealth />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Stats Overview */}
            <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Assessments Today</h3>
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
                <div className="text-3xl font-bold text-primary-400 mb-2">{assessmentResults.length}</div>
                <div className="text-sm text-gray-400">+12% from yesterday</div>
              </div>
              
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Privacy Budget</h3>
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-green-400 mb-2">0.85</div>
                <div className="text-sm text-gray-400">Remaining epsilon</div>
              </div>
              
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Model Accuracy</h3>
                  <CheckCircle className="w-6 h-6 text-accent-400" />
                </div>
                <div className="text-3xl font-bold text-accent-400 mb-2">94.2%</div>
                <div className="text-sm text-gray-400">Cross-validation score</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

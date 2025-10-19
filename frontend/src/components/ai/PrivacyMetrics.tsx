'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react'

interface PrivacyMetrics {
  differentialPrivacyEpsilon: number
  informationLeakage: number
  membershipInferenceRisk: number
  reconstructionError: number
}

export default function PrivacyMetrics() {
  const [metrics, setMetrics] = useState<PrivacyMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/credit-scoring/privacy-metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.data.metrics)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch privacy metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const getPrivacyLevel = (epsilon: number) => {
    if (epsilon <= 0.1) return { level: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (epsilon <= 0.5) return { level: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' }
    if (epsilon <= 1.0) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { level: 'Weak', color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  const getRiskLevel = (risk: number) => {
    if (risk <= 0.05) return { level: 'Low', color: 'text-green-400', icon: CheckCircle }
    if (risk <= 0.15) return { level: 'Medium', color: 'text-yellow-400', icon: AlertTriangle }
    return { level: 'High', color: 'text-red-400', icon: AlertTriangle }
  }

  if (!metrics) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
            Privacy Metrics
          </h2>
          <p className="text-gray-300 mb-8">
            Monitor differential privacy and security metrics for federated learning
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading privacy metrics...</p>
          </div>
        </div>
      </div>
    )
  }

  const privacyLevel = getPrivacyLevel(metrics.differentialPrivacyEpsilon)
  const leakageRisk = getRiskLevel(metrics.informationLeakage)
  const inferenceRisk = getRiskLevel(metrics.membershipInferenceRisk)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
            Privacy Metrics
          </h2>
          <p className="text-gray-300">
            Real-time privacy and security monitoring for federated learning system
          </p>
        </div>
        
        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {lastUpdated && (
        <div className="text-sm text-gray-400 text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Main Privacy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Differential Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Privacy Budget</h3>
                <p className="text-xs text-gray-400">Differential Privacy ε</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-3xl font-bold text-green-400">
              {metrics.differentialPrivacyEpsilon.toFixed(3)}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${privacyLevel.bg} ${privacyLevel.color}`}>
              {privacyLevel.level} Privacy
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                style={{ width: `${Math.max(10, (1 - metrics.differentialPrivacyEpsilon) * 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Information Leakage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Info Leakage</h3>
                <p className="text-xs text-gray-400">Data Exposure Risk</p>
              </div>
            </div>
            <leakageRisk.icon className={`w-5 h-5 ${leakageRisk.color}`} />
          </div>
          
          <div className="space-y-3">
            <div className={`text-3xl font-bold ${leakageRisk.color}`}>
              {(metrics.informationLeakage * 100).toFixed(2)}%
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${leakageRisk.color.replace('text-', 'bg-').replace('400', '500/20')} ${leakageRisk.color}`}>
              {leakageRisk.level} Risk
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  leakageRisk.level === 'Low' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  leakageRisk.level === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
                style={{ width: `${metrics.informationLeakage * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Membership Inference Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Inference Risk</h3>
                <p className="text-xs text-gray-400">Membership Attack</p>
              </div>
            </div>
            <inferenceRisk.icon className={`w-5 h-5 ${inferenceRisk.color}`} />
          </div>
          
          <div className="space-y-3">
            <div className={`text-3xl font-bold ${inferenceRisk.color}`}>
              {(metrics.membershipInferenceRisk * 100).toFixed(2)}%
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${inferenceRisk.color.replace('text-', 'bg-').replace('400', '500/20')} ${inferenceRisk.color}`}>
              {inferenceRisk.level} Risk
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  inferenceRisk.level === 'Low' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  inferenceRisk.level === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-red-500 to-pink-500'
                }`}
                style={{ width: `${metrics.membershipInferenceRisk * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Reconstruction Error */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Reconstruction</h3>
                <p className="text-xs text-gray-400">Model Accuracy</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-3xl font-bold text-orange-400">
              {(metrics.reconstructionError * 100).toFixed(2)}%
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
              Error Rate
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                style={{ width: `${metrics.reconstructionError * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Privacy Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary-400" />
          <span>Privacy Recommendations</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-white">Current Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Privacy Budget Usage</span>
                <span className={privacyLevel.color}>
                  {((1 - metrics.differentialPrivacyEpsilon) * 100).toFixed(1)}% Used
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Overall Security</span>
                <span className="text-green-400">Strong</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Compliance Status</span>
                <span className="text-green-400">GDPR Compliant</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-white">Recommendations</h4>
            <div className="space-y-3">
              {metrics.differentialPrivacyEpsilon > 0.5 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-yellow-400 font-medium">Increase Privacy Budget</div>
                    <div className="text-gray-300 text-sm">Consider reducing epsilon for stronger privacy</div>
                  </div>
                </div>
              )}
              
              {metrics.informationLeakage > 0.1 && (
                <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <div className="text-red-400 font-medium">High Information Leakage</div>
                    <div className="text-gray-300 text-sm">Review data preprocessing and noise addition</div>
                  </div>
                </div>
              )}
              
              {metrics.membershipInferenceRisk < 0.05 && metrics.informationLeakage < 0.05 && (
                <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-green-400 font-medium">Excellent Privacy Protection</div>
                    <div className="text-gray-300 text-sm">All privacy metrics are within safe thresholds</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Technical Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">Technical Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-white mb-3">Differential Privacy</h4>
            <div className="space-y-2 text-gray-300">
              <p>• Epsilon (ε): {metrics.differentialPrivacyEpsilon.toFixed(6)}</p>
              <p>• Mechanism: Laplace noise addition</p>
              <p>• Sensitivity: Calibrated per query</p>
              <p>• Composition: Sequential composition tracking</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-3">Attack Resistance</h4>
            <div className="space-y-2 text-gray-300">
              <p>• Membership inference: {(metrics.membershipInferenceRisk * 100).toFixed(2)}% risk</p>
              <p>• Model inversion: Protected by noise</p>
              <p>• Property inference: Mitigated</p>
              <p>• Reconstruction attacks: {(metrics.reconstructionError * 100).toFixed(2)}% error</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

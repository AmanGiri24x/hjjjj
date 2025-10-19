'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Server,
  Brain,
  Shield
} from 'lucide-react'

interface SystemHealthData {
  status: string
  federatedLearning: {
    status: string
    privacyBudget: number
    informationLeakage: number
  }
  graphNeuralNetwork: {
    status: string
    embeddingDimension: number
    layers: number
  }
  explainabilityEngine: {
    status: string
    features: string[]
  }
  timestamp: string
}

export default function SystemHealth() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchHealthData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/v1/credit-scoring/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setHealthData(data.data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
      case 'active':
      case 'ready':
        return { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle }
      case 'warning':
      case 'degraded':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: AlertTriangle }
      case 'error':
      case 'down':
      case 'failed':
        return { color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle }
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: AlertTriangle }
    }
  }

  if (!healthData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
            System Health
          </h2>
          <p className="text-gray-300 mb-8">
            Monitor the health and performance of federated learning components
          </p>
        </div>

        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading system health...</p>
          </div>
        </div>
      </div>
    )
  }

  const overallStatus = getStatusColor(healthData.status)
  const flStatus = getStatusColor(healthData.federatedLearning.status)
  const gnnStatus = getStatusColor(healthData.graphNeuralNetwork.status)
  const explainStatus = getStatusColor(healthData.explainabilityEngine.status)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
            System Health
          </h2>
          <p className="text-gray-300">
            Real-time monitoring of federated learning system components
          </p>
        </div>
        
        <button
          onClick={fetchHealthData}
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

      {/* Overall System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 ${overallStatus.bg} rounded-xl flex items-center justify-center`}>
              <overallStatus.icon className={`w-8 h-8 ${overallStatus.color}`} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">System Status</h3>
              <p className={`text-lg font-medium ${overallStatus.color} capitalize`}>
                {healthData.status}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-400">99.9%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="w-5 h-5 text-primary-400" />
              <span className="text-white font-medium">Response Time</span>
            </div>
            <div className="text-2xl font-bold text-primary-400">45ms</div>
            <div className="text-sm text-gray-400">Average latency</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className="w-5 h-5 text-accent-400" />
              <span className="text-white font-medium">Throughput</span>
            </div>
            <div className="text-2xl font-bold text-accent-400">1.2k</div>
            <div className="text-sm text-gray-400">Requests/minute</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Server className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Load</span>
            </div>
            <div className="text-2xl font-bold text-green-400">23%</div>
            <div className="text-sm text-gray-400">CPU usage</div>
          </div>
        </div>
      </motion.div>

      {/* Component Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Federated Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${flStatus.bg} rounded-lg flex items-center justify-center`}>
                <Network className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Federated Learning</h3>
                <p className={`text-sm ${flStatus.color} capitalize`}>
                  {healthData.federatedLearning.status}
                </p>
              </div>
            </div>
            <flStatus.icon className={`w-5 h-5 ${flStatus.color}`} />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Privacy Budget</span>
              <span className="text-green-400 font-medium">
                {healthData.federatedLearning.privacyBudget.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Info Leakage</span>
              <span className="text-blue-400 font-medium">
                {(healthData.federatedLearning.informationLeakage * 100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full w-4/5" />
            </div>
          </div>
        </motion.div>

        {/* Graph Neural Network */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${gnnStatus.bg} rounded-lg flex items-center justify-center`}>
                <Brain className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Graph Neural Network</h3>
                <p className={`text-sm ${gnnStatus.color} capitalize`}>
                  {healthData.graphNeuralNetwork.status}
                </p>
              </div>
            </div>
            <gnnStatus.icon className={`w-5 h-5 ${gnnStatus.color}`} />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Embedding Dim</span>
              <span className="text-accent-400 font-medium">
                {healthData.graphNeuralNetwork.embeddingDimension}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Layers</span>
              <span className="text-accent-400 font-medium">
                {healthData.graphNeuralNetwork.layers}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-accent-500 to-pink-500 h-2 rounded-full w-5/6" />
            </div>
          </div>
        </motion.div>

        {/* Explainability Engine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${explainStatus.bg} rounded-lg flex items-center justify-center`}>
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Explainability</h3>
                <p className={`text-sm ${explainStatus.color} capitalize`}>
                  {healthData.explainabilityEngine.status}
                </p>
              </div>
            </div>
            <explainStatus.icon className={`w-5 h-5 ${explainStatus.color}`} />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Features</span>
              <span className="text-purple-400 font-medium">
                {healthData.explainabilityEngine.features.length}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              {healthData.explainabilityEngine.features.join(', ')}
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-400" />
          <span>Performance Metrics</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">CPU Usage</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">23%</div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '23%' }} />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">Memory</span>
            </div>
            <div className="text-2xl font-bold text-green-400">67%</div>
            <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '67%' }} />
            </div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium">Network</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">12MB/s</div>
            <div className="text-sm text-gray-400">Throughput</div>
          </div>
          
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">Requests</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">1,247</div>
            <div className="text-sm text-gray-400">Last hour</div>
          </div>
        </div>
      </motion.div>

      {/* System Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">System Alerts</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <div className="text-green-400 font-medium">All Systems Operational</div>
              <div className="text-gray-300 text-sm">All components are running within normal parameters</div>
              <div className="text-gray-400 text-xs mt-1">2 minutes ago</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <div className="text-blue-400 font-medium">Model Update Completed</div>
              <div className="text-gray-300 text-sm">Federated learning round #247 completed successfully</div>
              <div className="text-gray-400 text-xs mt-1">15 minutes ago</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <div className="text-purple-400 font-medium">Privacy Budget Renewed</div>
              <div className="text-gray-300 text-sm">Differential privacy budget reset for new epoch</div>
              <div className="text-gray-400 text-xs mt-1">1 hour ago</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

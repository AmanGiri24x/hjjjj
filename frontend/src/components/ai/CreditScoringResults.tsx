'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  BarChart3,
  Network,
  Clock,
  User,
  Shield
} from 'lucide-react'

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

interface CreditScoringResultsProps {
  results: CreditAssessment[]
}

export default function CreditScoringResults({ results }: CreditScoringResultsProps) {
  const [selectedResult, setSelectedResult] = useState<CreditAssessment | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('list')

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW_RISK': return 'text-green-400'
      case 'MEDIUM_RISK': return 'text-yellow-400'
      case 'HIGH_RISK': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW_RISK': return CheckCircle
      case 'MEDIUM_RISK': return AlertTriangle
      case 'HIGH_RISK': return XCircle
      default: return AlertTriangle
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-red-400'
    if (score >= 0.4) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-12 h-12 text-primary-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-4">No Assessments Yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Complete a credit assessment to see detailed results and analytics here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
            Assessment Results
          </h2>
          <p className="text-gray-300">
            {results.length} assessment{results.length !== 1 ? 's' : ''} completed
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-gray-300 hover:text-white'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'detailed'
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-gray-300 hover:text-white'
            }`}
          >
            Detailed View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => {
            const RiskIcon = getRiskIcon(result.riskLevel)
            return (
              <motion.div
                key={result.applicantId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-6 hover-lift cursor-pointer"
                onClick={() => setSelectedResult(result)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{result.applicantId}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(result.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <RiskIcon className={`w-6 h-6 ${getRiskColor(result.riskLevel)}`} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Credit Score</span>
                    <span className={`font-bold ${getScoreColor(result.creditScore)}`}>
                      {(result.creditScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Confidence</span>
                    <span className="text-white font-medium">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Risk Level</span>
                    <span className={`font-medium ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <button className="w-full text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((result, index) => {
            const RiskIcon = getRiskIcon(result.riskLevel)
            return (
              <motion.div
                key={result.applicantId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-xl p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Summary */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{result.applicantId}</h3>
                        <p className="text-gray-400 flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(result.timestamp).toLocaleString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-300">Credit Score</span>
                          <RiskIcon className={`w-5 h-5 ${getRiskColor(result.riskLevel)}`} />
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(result.creditScore)}`}>
                          {(result.creditScore * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          Risk Level: <span className={getRiskColor(result.riskLevel)}>
                            {result.riskLevel.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-gray-300 mb-2">Confidence</div>
                        <div className="text-2xl font-bold text-white">
                          {(result.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Importance */}
                  <div className="lg:col-span-1">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary-400" />
                      <span>Feature Importance</span>
                    </h4>
                    
                    <div className="space-y-3">
                      {Object.entries(result.explanation.featureImportance)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([feature, importance]) => (
                          <div key={feature} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white capitalize text-sm">
                                {feature.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="text-primary-400 font-medium text-sm">
                                {(importance * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-accent-500 h-1.5 rounded-full"
                                style={{ width: `${importance * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Network Analysis */}
                  <div className="lg:col-span-1">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Network className="w-5 h-5 text-primary-400" />
                      <span>Network Analysis</span>
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white font-medium mb-2">Node Connections</div>
                        <div className="text-2xl font-bold text-primary-400">
                          {Object.keys(result.explanation.nodeImportance).length}
                        </div>
                        <div className="text-sm text-gray-400">Connected entities</div>
                      </div>
                      
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white font-medium mb-2">Edge Relationships</div>
                        <div className="text-2xl font-bold text-accent-400">
                          {Object.keys(result.explanation.edgeImportance).length}
                        </div>
                        <div className="text-sm text-gray-400">Network relationships</div>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-white font-medium mb-2">Top Influences</div>
                        <div className="space-y-2">
                          {Object.entries(result.explanation.nodeImportance)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 3)
                            .map(([node, importance]) => (
                              <div key={node} className="flex justify-between text-sm">
                                <span className="text-gray-300">{node}</span>
                                <span className="text-primary-400">
                                  {(importance * 100).toFixed(0)}%
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanations */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-primary-400" />
                        <span>Local Explanation</span>
                      </h5>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {result.explanation.local}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                        <Network className="w-5 h-5 text-accent-400" />
                        <span>Global Pattern</span>
                      </h5>
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {result.explanation.global}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Detailed Analysis: {selectedResult.applicantId}
                </h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              {/* Modal content would go here - similar to detailed view above */}
              <div className="text-gray-300">
                <p>Detailed analysis view for {selectedResult.applicantId}</p>
                {/* Add more detailed content as needed */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

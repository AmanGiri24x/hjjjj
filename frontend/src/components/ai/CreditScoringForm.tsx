'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  DollarSign, 
  Briefcase, 
  GraduationCap, 
  CreditCard, 
  Users, 
  Building, 
  Shield,
  Send,
  Plus,
  Trash2
} from 'lucide-react'

interface CreditApplicant {
  id: string
  personalInfo: {
    age: number
    income: number
    employmentYears: number
    education: string
  }
  financialHistory: {
    creditScore: number
    loanHistory: Array<{
      amount: number
      duration: number
      status: 'paid' | 'defaulted' | 'current'
      timestamp: Date
    }>
    paymentBehavior: Array<{
      onTimePayments: number
      latePayments: number
      averageDelay: number
    }>
  }
  graphConnections: {
    socialConnections: string[]
    businessConnections: string[]
    guarantorRelations: string[]
  }
}

interface CreditScoringFormProps {
  onAssessmentComplete: (result: any) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function CreditScoringForm({ onAssessmentComplete, isLoading, setIsLoading }: CreditScoringFormProps) {
  const [formData, setFormData] = useState<CreditApplicant>({
    id: '',
    personalInfo: {
      age: 30,
      income: 50000,
      employmentYears: 5,
      education: 'Bachelor\'s Degree'
    },
    financialHistory: {
      creditScore: 700,
      loanHistory: [],
      paymentBehavior: []
    },
    graphConnections: {
      socialConnections: [],
      businessConnections: [],
      guarantorRelations: []
    }
  })

  const [newConnection, setNewConnection] = useState({ type: '', value: '' })

  const educationOptions = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate',
    'Professional Certification'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/credit-scoring/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Assessment failed')
      }

      const result = await response.json()
      onAssessmentComplete(result.data)
    } catch (error) {
      console.error('Assessment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addConnection = () => {
    if (!newConnection.value || !newConnection.type) return

    setFormData(prev => ({
      ...prev,
      graphConnections: {
        ...prev.graphConnections,
        [newConnection.type]: [...prev.graphConnections[newConnection.type as keyof typeof prev.graphConnections], newConnection.value]
      }
    }))
    setNewConnection({ type: '', value: '' })
  }

  const removeConnection = (type: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      graphConnections: {
        ...prev.graphConnections,
        [type]: prev.graphConnections[type as keyof typeof prev.graphConnections].filter((_, i) => i !== index)
      }
    }))
  }

  const addLoanRecord = () => {
    setFormData(prev => ({
      ...prev,
      financialHistory: {
        ...prev.financialHistory,
        loanHistory: [...prev.financialHistory.loanHistory, {
          amount: 10000,
          duration: 24,
          status: 'current' as const,
          timestamp: new Date()
        }]
      }
    }))
  }

  const addPaymentBehavior = () => {
    setFormData(prev => ({
      ...prev,
      financialHistory: {
        ...prev.financialHistory,
        paymentBehavior: [...prev.financialHistory.paymentBehavior, {
          onTimePayments: 12,
          latePayments: 0,
          averageDelay: 0
        }]
      }
    }))
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-4">
          Credit Risk Assessment
        </h2>
        <p className="text-gray-300">
          Enter applicant information for AI-powered credit scoring analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <motion.div 
          className="glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-semibold text-white">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Applicant ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter unique ID"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.personalInfo.age}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, age: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Annual Income ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.personalInfo.income}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, income: parseInt(e.target.value) }
                  }))}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Employment Years
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.personalInfo.employmentYears}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, employmentYears: parseFloat(e.target.value) }
                  }))}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Education Level
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  value={formData.personalInfo.education}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, education: e.target.value }
                  }))}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {educationOptions.map(option => (
                    <option key={option} value={option} className="bg-slate-800">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Financial History */}
        <motion.div 
          className="glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-semibold text-white">Financial History</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Credit Score (300-850)
              </label>
              <input
                type="number"
                min="300"
                max="850"
                value={formData.financialHistory.creditScore}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  financialHistory: { ...prev.financialHistory, creditScore: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">Loan History</h4>
                <button
                  type="button"
                  onClick={addLoanRecord}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Loan</span>
                </button>
              </div>
              
              {formData.financialHistory.loanHistory.map((loan, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={loan.amount}
                      onChange={(e) => {
                        const newHistory = [...formData.financialHistory.loanHistory]
                        newHistory[index].amount = parseInt(e.target.value)
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, loanHistory: newHistory }
                        }))
                      }}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Duration (months)"
                      value={loan.duration}
                      onChange={(e) => {
                        const newHistory = [...formData.financialHistory.loanHistory]
                        newHistory[index].duration = parseInt(e.target.value)
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, loanHistory: newHistory }
                        }))
                      }}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                    <select
                      value={loan.status}
                      onChange={(e) => {
                        const newHistory = [...formData.financialHistory.loanHistory]
                        newHistory[index].status = e.target.value as any
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, loanHistory: newHistory }
                        }))
                      }}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                    >
                      <option value="current">Current</option>
                      <option value="paid">Paid</option>
                      <option value="defaulted">Defaulted</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const newHistory = formData.financialHistory.loanHistory.filter((_, i) => i !== index)
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, loanHistory: newHistory }
                        }))
                      }}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">Payment Behavior</h4>
                <button
                  type="button"
                  onClick={addPaymentBehavior}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg hover:bg-primary-500/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Record</span>
                </button>
              </div>
              
              {formData.financialHistory.paymentBehavior.map((behavior, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="number"
                      placeholder="On-time payments"
                      value={behavior.onTimePayments}
                      onChange={(e) => {
                        const newBehavior = [...formData.financialHistory.paymentBehavior]
                        newBehavior[index].onTimePayments = parseInt(e.target.value)
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, paymentBehavior: newBehavior }
                        }))
                      }}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Late payments"
                      value={behavior.latePayments}
                      onChange={(e) => {
                        const newBehavior = [...formData.financialHistory.paymentBehavior]
                        newBehavior[index].latePayments = parseInt(e.target.value)
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, paymentBehavior: newBehavior }
                        }))
                      }}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Avg delay (days)"
                      value={behavior.averageDelay}
                      onChange={(e) => {
                        const newBehavior = [...formData.financialHistory.paymentBehavior]
                        newBehavior[index].averageDelay = parseInt(e.target.value)
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, paymentBehavior: newBehavior }
                        }))
                      }}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newBehavior = formData.financialHistory.paymentBehavior.filter((_, i) => i !== index)
                        setFormData(prev => ({
                          ...prev,
                          financialHistory: { ...prev.financialHistory, paymentBehavior: newBehavior }
                        }))
                      }}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Graph Connections */}
        <motion.div 
          className="glass rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-semibold text-white">Network Connections</h3>
          </div>
          
          <div className="space-y-6">
            <div className="flex space-x-4">
              <select
                value={newConnection.type}
                onChange={(e) => setNewConnection(prev => ({ ...prev, type: e.target.value }))}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select type</option>
                <option value="socialConnections">Social Connection</option>
                <option value="businessConnections">Business Connection</option>
                <option value="guarantorRelations">Guarantor</option>
              </select>
              <input
                type="text"
                value={newConnection.value}
                onChange={(e) => setNewConnection(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Connection ID"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={addConnection}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Add
              </button>
            </div>

            {['socialConnections', 'businessConnections', 'guarantorRelations'].map(type => (
              <div key={type}>
                <h4 className="text-lg font-medium text-white mb-3 capitalize">
                  {type.replace('Connections', ' Connections').replace('Relations', ' Relations')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.graphConnections[type as keyof typeof formData.graphConnections].map((connection, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                      <span className="text-white text-sm">{connection}</span>
                      <button
                        type="button"
                        onClick={() => removeConnection(type, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            type="submit"
            disabled={isLoading || !formData.id}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl neon-blue hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Assess Credit Risk</span>
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  )
}

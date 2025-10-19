'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Wallet, 
  Home, 
  Car, 
  GraduationCap, 
  Heart, 
  Plane,
  Building,
  Briefcase,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { useFinancial } from '@/contexts/FinancialContext'
import { useAuthStore } from '@/store/authStore'

interface OnboardingData {
  personalInfo: {
    age: number
    occupation: string
    city: string
    phone: string
  }
  financialInfo: {
    monthlyIncome: number
    monthlyExpenses: number
    currentSavings: number
    currentInvestments: number
    currentDebt: number
  }
  goals: Array<{
    name: string
    targetAmount: number
    targetDate: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
}

const goalTemplates = [
  { name: 'Emergency Fund', icon: Wallet, category: 'emergency', defaultAmount: 300000 },
  { name: 'House Down Payment', icon: Home, category: 'property', defaultAmount: 2000000 },
  { name: 'Car Purchase', icon: Car, category: 'vehicle', defaultAmount: 800000 },
  { name: 'Education Fund', icon: GraduationCap, category: 'education', defaultAmount: 500000 },
  { name: 'Wedding', icon: Heart, category: 'life_event', defaultAmount: 1000000 },
  { name: 'Vacation', icon: Plane, category: 'lifestyle', defaultAmount: 150000 },
  { name: 'Retirement', icon: Building, category: 'retirement', defaultAmount: 5000000 },
  { name: 'Business Investment', icon: Briefcase, category: 'business', defaultAmount: 1500000 }
]

export default function SmartOnboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuthStore()
  const { addGoal, initializeUserData, updateFinancialData } = useFinancial()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: { age: 25, occupation: '', city: '', phone: '' },
    financialInfo: { monthlyIncome: 0, monthlyExpenses: 0, currentSavings: 0, currentInvestments: 0, currentDebt: 0 },
    goals: [],
    riskProfile: 'moderate'
  })

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      // Initialize user financial data
      await initializeUserData()
      
      // Update with onboarding data
      await updateFinancialData({
        monthlyIncome: onboardingData.financialInfo.monthlyIncome,
        monthlyExpenses: onboardingData.financialInfo.monthlyExpenses,
        savings: onboardingData.financialInfo.currentSavings,
        investments: onboardingData.financialInfo.currentInvestments,
        debt: onboardingData.financialInfo.currentDebt,
        netWorth: onboardingData.financialInfo.currentSavings + onboardingData.financialInfo.currentInvestments - onboardingData.financialInfo.currentDebt,
        isNewUser: false
      })

      // Add goals
      for (const goal of onboardingData.goals) {
        await addGoal({
          name: goal.name,
          target_amount: goal.targetAmount,
          category: goal.category,
          target_date: goal.targetDate,
          priority: goal.priority
        })
      }

      onComplete()
    } catch (error) {
      console.error('Onboarding completion error:', error)
    }
  }

  const addGoalToOnboarding = (template: typeof goalTemplates[0]) => {
    const newGoal = {
      name: template.name,
      targetAmount: template.defaultAmount,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      priority: 'medium' as const,
      category: template.category
    }
    
    setOnboardingData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }))
  }

  const removeGoal = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to DhanAi! 🎉</h2>
              <p className="text-gray-600 text-lg">Let's personalize your financial journey in just a few steps</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={onboardingData.personalInfo.age}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, age: parseInt(e.target.value) || 25 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <input
                  type="text"
                  value={onboardingData.personalInfo.occupation}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, occupation: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer, Teacher, Doctor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={onboardingData.personalInfo.city}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, city: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={onboardingData.personalInfo.phone}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Overview 💰</h2>
              <p className="text-gray-600 text-lg">Help us understand your current financial situation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income (₹)</label>
                <input
                  type="number"
                  value={onboardingData.financialInfo.monthlyIncome}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, monthlyIncome: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 75000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Expenses (₹)</label>
                <input
                  type="number"
                  value={onboardingData.financialInfo.monthlyExpenses}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, monthlyExpenses: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 45000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Savings (₹)</label>
                <input
                  type="number"
                  value={onboardingData.financialInfo.currentSavings}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, currentSavings: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 200000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Investments (₹)</label>
                <input
                  type="number"
                  value={onboardingData.financialInfo.currentInvestments}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, currentInvestments: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 150000"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Debt (₹)</label>
                <input
                  type="number"
                  value={onboardingData.financialInfo.currentDebt}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    financialInfo: { ...prev.financialInfo, currentDebt: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 50000 (Enter 0 if no debt)"
                />
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Financial Snapshot</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Monthly Surplus:</span>
                  <span className="font-semibold text-green-600 ml-2">
                    ₹{(onboardingData.financialInfo.monthlyIncome - onboardingData.financialInfo.monthlyExpenses).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Net Worth:</span>
                  <span className="font-semibold text-blue-600 ml-2">
                    ₹{(onboardingData.financialInfo.currentSavings + onboardingData.financialInfo.currentInvestments - onboardingData.financialInfo.currentDebt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Financial Goals 🎯</h2>
              <p className="text-gray-600 text-lg">What are you saving for? Select your goals</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {goalTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => addGoalToOnboarding(template)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                >
                  <template.icon className="w-8 h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{template.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Goals */}
            {onboardingData.goals.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Selected Goals</h3>
                {onboardingData.goals.map((goal, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <button
                        onClick={() => removeGoal(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Target Amount (₹)</label>
                        <input
                          type="number"
                          value={goal.targetAmount}
                          onChange={(e) => {
                            const updatedGoals = [...onboardingData.goals]
                            updatedGoals[index].targetAmount = parseInt(e.target.value) || 0
                            setOnboardingData(prev => ({ ...prev, goals: updatedGoals }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Target Date</label>
                        <input
                          type="date"
                          value={goal.targetDate}
                          onChange={(e) => {
                            const updatedGoals = [...onboardingData.goals]
                            updatedGoals[index].targetDate = e.target.value
                            setOnboardingData(prev => ({ ...prev, goals: updatedGoals }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Priority</label>
                        <select
                          value={goal.priority}
                          onChange={(e) => {
                            const updatedGoals = [...onboardingData.goals]
                            updatedGoals[index].priority = e.target.value as 'high' | 'medium' | 'low'
                            setOnboardingData(prev => ({ ...prev, goals: updatedGoals }))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Risk Profile 📊</h2>
              <p className="text-gray-600 text-lg">How comfortable are you with investment risk?</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  value: 'conservative',
                  title: 'Conservative',
                  description: 'I prefer stable returns with minimal risk. Safety is my priority.',
                  returns: '6-8% annually',
                  color: 'green'
                },
                {
                  value: 'moderate',
                  title: 'Moderate',
                  description: 'I can accept some risk for potentially higher returns.',
                  returns: '10-12% annually',
                  color: 'blue'
                },
                {
                  value: 'aggressive',
                  title: 'Aggressive',
                  description: 'I am comfortable with high risk for maximum growth potential.',
                  returns: '15-18% annually',
                  color: 'purple'
                }
              ].map((profile) => (
                <button
                  key={profile.value}
                  onClick={() => setOnboardingData(prev => ({ ...prev, riskProfile: profile.value as any }))}
                  className={`w-full p-6 border-2 rounded-xl text-left transition-all ${
                    onboardingData.riskProfile === profile.value
                      ? `border-${profile.color}-500 bg-${profile.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{profile.title}</h3>
                    <span className={`text-sm font-medium text-${profile.color}-600`}>{profile.returns}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{profile.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">All Set! 🎉</h2>
              <p className="text-gray-600 text-lg">Review your information before we create your personalized dashboard</p>
            </div>

            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Financial Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Income:</span>
                      <span className="font-medium">₹{onboardingData.financialInfo.monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Expenses:</span>
                      <span className="font-medium">₹{onboardingData.financialInfo.monthlyExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Worth:</span>
                      <span className="font-medium text-blue-600">
                        ₹{(onboardingData.financialInfo.currentSavings + onboardingData.financialInfo.currentInvestments - onboardingData.financialInfo.currentDebt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Goals & Risk Profile</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Goals:</span>
                      <span className="font-medium">{onboardingData.goals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Profile:</span>
                      <span className="font-medium capitalize">{onboardingData.riskProfile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Goal Amount:</span>
                      <span className="font-medium text-green-600">
                        ₹{onboardingData.goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals List */}
              {onboardingData.goals.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Your Financial Goals</h3>
                  <div className="space-y-3">
                    {onboardingData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium text-gray-900">{goal.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({goal.priority} priority)</span>
                        </div>
                        <span className="font-medium text-blue-600">₹{goal.targetAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              <span>{currentStep === totalSteps ? 'Complete Setup' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

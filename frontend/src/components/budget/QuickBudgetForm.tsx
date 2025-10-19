'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, X, DollarSign, Calendar, Tag, FileText } from 'lucide-react'
import { DatabaseService } from '@/services/database'
import { useAuthStore } from '@/store/authStore'

interface QuickBudgetFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function QuickBudgetForm({ onClose, onSuccess }: QuickBudgetFormProps) {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    limit_amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const budgetCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Personal Care',
    'Groceries',
    'Rent/Mortgage',
    'Insurance',
    'Subscriptions',
    'Other'
  ]

  const calculateEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate)
    let end = new Date(start)
    
    switch (period) {
      case 'weekly':
        end.setDate(start.getDate() + 7)
        break
      case 'monthly':
        end.setMonth(start.getMonth() + 1)
        break
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1)
        break
    }
    
    return end.toISOString().split('T')[0]
  }

  const handlePeriodChange = (period: 'weekly' | 'monthly' | 'yearly') => {
    const endDate = calculateEndDate(formData.start_date, period)
    setFormData(prev => ({ ...prev, period, end_date: endDate }))
  }

  const handleStartDateChange = (startDate: string) => {
    const endDate = calculateEndDate(startDate, formData.period)
    setFormData(prev => ({ ...prev, start_date: startDate, end_date: endDate }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category || !formData.limit_amount || !user?.id) return

    setIsSubmitting(true)
    try {
      await DatabaseService.addBudget({
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        limit_amount: parseFloat(formData.limit_amount),
        spent_amount: 0,
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: true
      })
      
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to add budget:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-calculate end date on mount
  React.useEffect(() => {
    const endDate = calculateEndDate(formData.start_date, formData.period)
    setFormData(prev => ({ ...prev, end_date: endDate }))
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Budget</h2>
              <p className="text-sm text-gray-600">Set spending limits for categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Budget Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Budget Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Monthly Food Budget, Entertainment Limit"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {budgetCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget Limit (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.limit_amount}
              onChange={(e) => setFormData(prev => ({ ...prev, limit_amount: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Budget Period</label>
            <div className="grid grid-cols-3 gap-3">
              {(['weekly', 'monthly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handlePeriodChange(period)}
                  className={`p-3 rounded-lg border-2 transition-all capitalize ${
                    formData.period === period
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                readOnly
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>

          {/* Budget Preview */}
          {formData.limit_amount && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Budget Summary</h4>
              <div className="space-y-1 text-sm text-purple-700">
                <p>Category: <span className="font-medium">{formData.category || 'Not selected'}</span></p>
                <p>Limit: <span className="font-medium">₹{parseFloat(formData.limit_amount || '0').toLocaleString()}</span></p>
                <p>Period: <span className="font-medium capitalize">{formData.period}</span></p>
                {formData.period === 'monthly' && formData.limit_amount && (
                  <p>Daily average: <span className="font-medium">₹{(parseFloat(formData.limit_amount) / 30).toFixed(0)}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.category || !formData.limit_amount}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PersonalFinanceDashboard from '@/components/dashboard/PersonalFinanceDashboard'
import SavingsDetailView from '@/components/dashboard/SavingsDetailView'
import AIRecommendations from '@/components/dashboard/AIRecommendations'
import { FinancialProvider } from '@/contexts/FinancialContext'

export default function PersonalFinancePage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'savings' | 'expenses' | 'debt' | 'portfolio'>('dashboard')

  const handleViewChange = (view: 'dashboard' | 'savings' | 'expenses' | 'debt' | 'portfolio') => {
    setCurrentView(view)
  }

  return (
    <FinancialProvider>
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PersonalFinanceDashboard />
              <div className="px-6 pb-6">
                <AIRecommendations />
              </div>
            </motion.div>
          )}
          
          {currentView === 'savings' && (
            <motion.div
              key="savings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SavingsDetailView onBack={() => setCurrentView('dashboard')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FinancialProvider>
  )
}

'use client'

import { Suspense } from 'react'
import SmartOnboarding from '@/components/onboarding/SmartOnboarding'
import { FinancialProvider } from '@/contexts/FinancialContext'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  const handleOnboardingComplete = () => {
    router.push('/dashboard/personalized')
  }

  return (
    <FinancialProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading onboarding...</p>
          </div>
        </div>
      }>
        <SmartOnboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    </FinancialProvider>
  )
}

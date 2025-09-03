'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5'
import { authApi } from '@/lib/api'

export default function Step5Page() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    try {
      setLoading(true)
      
      // Get stored access token
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        console.error('No access token found')
        router.push('/dashboard') // Still redirect even if API fails
        return
      }

      // Call backend to update preferences and mark user as verified
      await authApi.updatePreferences({
        // You can add any preferences here if collected in previous steps
        onboarding_completed: true
      }, accessToken)

      localStorage.setItem('kilwa-onboarding-complete', 'true')
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to update preferences:', error)
      // Still redirect to dashboard even if API call fails
      localStorage.setItem('kilwa-onboarding-complete', 'true')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/onboarding/step-4')
  }

  return <OnboardingStep5 onComplete={handleComplete} onBack={handleBack} />
}
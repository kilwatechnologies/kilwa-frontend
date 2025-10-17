'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2'
import { authApi } from '@/lib/api'

function Step2Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const firstName = searchParams.get('firstName') || ''
  const lastName = searchParams.get('lastName') || ''
  const profilePicture = searchParams.get('profilePicture') || ''

  // Update profile for OAuth users when they reach step-2
  useEffect(() => {
    const updateOAuthProfile = async () => {
      if (email && (firstName || lastName || profilePicture)) {
        try {
          await authApi.updateProfile(email, firstName, lastName, profilePicture)
        } catch (err) {
          console.error('Failed to update OAuth user profile:', err)
        }
      }
    }

    updateOAuthProfile()
  }, [email, firstName, lastName, profilePicture])

  const handleNext = () => {
    // Pass email to step-3
    const params = new URLSearchParams()
    if (email) params.append('email', email)
    router.push(`/onboarding/step-3?${params.toString()}`)
  }

  const handleBack = () => {
    router.push('/onboarding/step-1')
  }

  return <OnboardingStep2 onNext={handleNext} onBack={handleBack} />
}

export default function Step2Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
      <Step2Content />
    </Suspense>
  )
}
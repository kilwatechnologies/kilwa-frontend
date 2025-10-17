'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import OnboardingStep1a from '@/components/onboarding/OnboardingStep1a'

function Step1aContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const isOAuth = searchParams.get('oauth') === 'google'

  const handleNext = (firstName: string, lastName: string) => {
    // Store data in URL params and move to profile picture step
    router.push(`/onboarding/step-1b?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&oauth=${isOAuth ? 'google' : 'false'}`)
  }

  const handleBack = () => {
    router.push('/onboarding/step-1')
  }

  return <OnboardingStep1a onNext={handleNext} onBack={handleBack} email={email} />
}

export default function Step1aPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>}>
      <Step1aContent />
    </Suspense>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import OnboardingStep1b from '@/components/onboarding/OnboardingStep1b'

function Step1bContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const firstName = searchParams.get('firstName') || ''
  const lastName = searchParams.get('lastName') || ''
  const isOAuth = searchParams.get('oauth') === 'google'

  const handleNext = async (profilePicture: string | null) => {
    // Move to password step for email signup or step-2 for OAuth
    if (isOAuth) {
      // For OAuth, go directly to step-2 with profile data
      router.push(`/onboarding/step-2?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&profilePicture=${encodeURIComponent(profilePicture || '')}`)
    } else {
      // For email signup, go to password step (step-1)
      router.push(`/onboarding/step-1?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&profilePicture=${encodeURIComponent(profilePicture || '')}`)
    }
  }

  const handleBack = () => {
    router.push(`/onboarding/step-1a?email=${encodeURIComponent(email)}&oauth=${isOAuth ? 'google' : 'false'}`)
  }

  return <OnboardingStep1b onNext={handleNext} onBack={handleBack} email={email} />
}

export default function Step1bPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>}>
      <Step1bContent />
    </Suspense>
  )
}

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import OnboardingVerifyEmail from '@/components/onboarding/OnboardingVerifyEmail'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const firstName = searchParams.get('firstName') || ''
  const lastName = searchParams.get('lastName') || ''
  const profilePicture = searchParams.get('profilePicture') || ''
  const blobName = searchParams.get('blobName') || ''

  const handleNext = (skipOnboarding: boolean = false) => {
    if (skipOnboarding) {
      router.push('/dashboard')
    } else {
      router.push(`/onboarding/step-2?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&profilePicture=${encodeURIComponent(profilePicture)}&blobName=${encodeURIComponent(blobName)}`)
    }
  }

  const handleBack = () => {
    router.push('/onboarding/step-1')
  }

  return <OnboardingVerifyEmail onNext={handleNext} onBack={handleBack} email={email} />
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
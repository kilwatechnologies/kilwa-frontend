'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1'

function Step1Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const userExists = searchParams.get('userExists') === 'true'
  const isOAuth = searchParams.get('oauth') === 'google'
  const firstName = searchParams.get('firstName') || ''
  const lastName = searchParams.get('lastName') || ''
  const profilePicture = searchParams.get('profilePicture') || ''
  const blobName = searchParams.get('blobName') || ''

  const handleNext = (email: string, skipOnboarding: boolean = false) => {
    if (skipOnboarding) {
      router.push('/dashboard')
    } else {
      // If OAuth user or existing user, skip email verification and go to step-2
      if (isOAuth || userExists) {
        router.push(`/onboarding/step-2?email=${encodeURIComponent(email)}`)
      } else {
        // New email/password user - needs email verification
        router.push(`/onboarding/verify-email?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&profilePicture=${encodeURIComponent(profilePicture)}&blobName=${encodeURIComponent(blobName)}`)
      }
    }
  }

  const handleBack = () => {
    router.push(`/onboarding/step-1b?email=${encodeURIComponent(email)}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`)
  }

  return <OnboardingStep1 onNext={handleNext} onBack={handleBack} email={email} userExists={userExists} isOAuth={isOAuth} firstName={firstName} lastName={lastName} profilePicture={profilePicture} blobName={blobName} />
}

export default function Step1Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
      <Step1Content />
    </Suspense>
  )
}
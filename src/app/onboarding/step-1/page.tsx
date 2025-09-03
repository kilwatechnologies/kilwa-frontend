'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1'

export default function Step1Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const userExists = searchParams.get('userExists') === 'true'
  const isOAuth = searchParams.get('oauth') === 'google'

  const handleNext = (email: string, skipOnboarding: boolean = false) => {
    if (skipOnboarding) {
      router.push('/dashboard')
    } else {
      // If OAuth user, skip email verification and go to step-2
      if (isOAuth) {
        router.push(`/onboarding/step-2?email=${encodeURIComponent(email)}`)
      } else {
        router.push(`/onboarding/verify-email?email=${encodeURIComponent(email)}`)
      }
    }
  }

  const handleBack = () => {
    router.push('/onboarding')
  }

  return <OnboardingStep1 onNext={handleNext} onBack={handleBack} email={email} userExists={userExists} isOAuth={isOAuth} />
}
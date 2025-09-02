'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import OnboardingVerifyEmail from '@/components/onboarding/OnboardingVerifyEmail'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const handleNext = (skipOnboarding: boolean = false) => {
    if (skipOnboarding) {
      router.push('/dashboard')
    } else {
      router.push('/onboarding/step-2')
    }
  }

  const handleBack = () => {
    router.push('/onboarding/step-1')
  }

  return <OnboardingVerifyEmail onNext={handleNext} onBack={handleBack} email={email} />
}
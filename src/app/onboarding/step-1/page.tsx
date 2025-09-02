'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1'

export default function Step1Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const userExists = searchParams.get('userExists') === 'true'

  const handleNext = (email: string, skipOnboarding: boolean = false) => {
    if (skipOnboarding) {
      router.push('/dashboard')
    } else {
      router.push(`/onboarding/verify-email?email=${encodeURIComponent(email)}`)
    }
  }

  const handleBack = () => {
    router.push('/onboarding')
  }

  return <OnboardingStep1 onNext={handleNext} onBack={handleBack} email={email} userExists={userExists} />
}
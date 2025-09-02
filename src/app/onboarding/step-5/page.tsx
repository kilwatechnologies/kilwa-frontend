'use client'

import { useRouter } from 'next/navigation'
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5'

export default function Step5Page() {
  const router = useRouter()

  const handleComplete = () => {
    localStorage.setItem('kilwa-onboarding-complete', 'true')
    router.push('/dashboard')
  }

  const handleBack = () => {
    router.push('/onboarding/step-4')
  }

  return <OnboardingStep5 onComplete={handleComplete} onBack={handleBack} />
}
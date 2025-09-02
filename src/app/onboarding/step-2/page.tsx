'use client'

import { useRouter } from 'next/navigation'
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2'

export default function Step2Page() {
  const router = useRouter()

  const handleNext = () => {
    router.push('/onboarding/step-3')
  }

  const handleBack = () => {
    router.push('/onboarding/step-1')
  }

  return <OnboardingStep2 onNext={handleNext} onBack={handleBack} />
}
'use client'

import { useRouter } from 'next/navigation'
import OnboardingStep4 from '@/components/onboarding/OnboardingStep4'

export default function Step4Page() {
  const router = useRouter()

  const handleNext = () => {
    router.push('/onboarding/step-5')
  }

  const handleBack = () => {
    router.push('/onboarding/step-3')
  }

  return <OnboardingStep4 onNext={handleNext} onBack={handleBack} />
}
'use client'

import { useRouter } from 'next/navigation'
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3'

export default function Step3Page() {
  const router = useRouter()

  const handleNext = () => {
    router.push('/onboarding/step-4')
  }

  const handleBack = () => {
    router.push('/onboarding/step-2')
  }

  return <OnboardingStep3 onNext={handleNext} onBack={handleBack} />
}
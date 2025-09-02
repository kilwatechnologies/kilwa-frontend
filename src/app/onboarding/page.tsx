'use client'

import { useRouter } from 'next/navigation'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'

export default function OnboardingPage() {
  const router = useRouter()

  const handleStart = (email: string, userExists: boolean) => {
    router.push(`/onboarding/step-1?email=${encodeURIComponent(email)}&userExists=${userExists}`)
  }

  return <OnboardingWelcome onStart={handleStart} />
}
'use client'

import { useRouter } from 'next/navigation'
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome'

export default function OnboardingPage() {
  const router = useRouter()

  const handleStart = (email: string, userExists: boolean) => {
    // For new users, go to Personal Info first
    // For existing users, go directly to password
    if (userExists) {
      router.push(`/onboarding/step-1?email=${encodeURIComponent(email)}&userExists=${userExists}`)
    } else {
      router.push(`/onboarding/step-1a?email=${encodeURIComponent(email)}&oauth=false`)
    }
  }

  return <OnboardingWelcome onStart={handleStart} />
}
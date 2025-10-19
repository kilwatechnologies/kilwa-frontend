'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import OnboardingStep3 from '@/components/onboarding/OnboardingStep3'
import { authApi } from '@/lib/api'

function Step3Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const handleNext = async (jobTitle: string, industry: string, country: string) => {
    try {
      // Update profile with job_title, industry, and country
      if (email) {
        console.log('Updating profile with:', { email, jobTitle, industry, country })
        const response = await authApi.updateProfile(email, undefined, undefined, undefined, undefined, jobTitle, industry, country)
        console.log('Profile update response:', response)
      } else {
        console.error('No email provided to update profile')
      }
      router.push('/onboarding/step-4')
    } catch (err) {
      console.error('Failed to update profile with job info:', err)
      // Continue to next step even if update fails
      router.push('/onboarding/step-4')
    }
  }

  const handleBack = () => {
    router.push('/onboarding/step-2')
  }

  return <OnboardingStep3 onNext={handleNext} onBack={handleBack} email={email} />
}

export default function Step3Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
      <Step3Content />
    </Suspense>
  )
}
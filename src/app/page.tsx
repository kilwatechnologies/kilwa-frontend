'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('kilwa-onboarding-complete')
    
    if (hasCompletedOnboarding) {
      router.push('/dashboard')
    } else {
      router.push('/onboarding')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  )
}
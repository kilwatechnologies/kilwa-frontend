'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setError(`Authentication error: ${error}`)
          setLoading(false)
          return
        }

        if (!code) {
          setError('No authorization code received')
          setLoading(false)
          return
        }

        // Exchange code for tokens via your backend
        const redirectUri = `${window.location.origin}/auth/callback`
        const response = await authApi.handleGoogleCallback(code, redirectUri)

        if (response.data.success) {
          // Store tokens in localStorage
          const responseData = response.data as any
          if (responseData.tokens) {
            localStorage.setItem('access_token', responseData.tokens.access_token)
            localStorage.setItem('refresh_token', responseData.tokens.refresh_token)
          }

          const user = responseData.user

          // For Google OAuth users:
          // - If user exists and verified: go to dashboard
          // - If new user: go directly to onboarding step-2 (skip password/email verification entirely)
          if (user?.is_verified) {
            router.push('/dashboard')
          } else {
            // New Google user - skip step-1 (password) and go directly to step-2
            router.push(`/onboarding/step-2?email=${encodeURIComponent(user?.email || '')}&oauth=google`)
          }
        } else {
          setError('Authentication failed')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError('Failed to complete authentication')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
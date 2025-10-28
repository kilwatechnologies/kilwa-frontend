import Image from 'next/image'
import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'

interface OnboardingStep1Props {
  onNext: (email: string, skipOnboarding?: boolean) => void
  onBack: () => void
  email: string
  userExists: boolean
  isOAuth?: boolean
  firstName?: string
  lastName?: string
  profilePicture?: string
  blobName?: string
}

export default function OnboardingStep1({ onNext, onBack, email, userExists, isOAuth = false, firstName = '', lastName = '', profilePicture = '', blobName = '' }: OnboardingStep1Props) {
  const [password, setPassword] = useState('')
  const [hasMinLength, setHasMinLength] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)
  const [hasUpperCase, setHasUpperCase] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-proceed for OAuth users (they don't need password)
  useEffect(() => {
    if (isOAuth && email) {
      // For Google OAuth users, just proceed to next step
      onNext(email, false)
    }
  }, [isOAuth, email, onNext])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    // Check password requirements
    setHasMinLength(value.length >= 8)
    setHasNumber(/\d/.test(value))
    setHasUpperCase(/[A-Z]/.test(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      setError('Please enter a password')
      return
    }

    if (!userExists && (!hasMinLength || !hasNumber || !hasUpperCase)) {
      setError('Password must meet all requirements')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate email before sending
      if (!email || !email.includes('@')) {
        setError('Invalid email address')
        return
      }

      const response = await authApi.continueAuth(email, password)
      const data = response.data

      if (data.success) {
        // Update profile data if provided (from step-1a and step-1b)
        if (!userExists && (firstName || lastName || profilePicture)) {
          try {
            console.log('Updating profile with:', { email, firstName, lastName, profilePicture, blobName })
            await authApi.updateProfile(email, firstName, lastName, profilePicture, blobName)
            console.log('Profile updated successfully')
          } catch (profileErr) {
            console.error('Profile update failed:', profileErr)
            // Don't block the flow if profile update fails
          }
        } else {
          console.log('Skipping profile update - conditions not met:', { userExists, firstName, lastName, profilePicture })
        }

        if (userExists && (data as any).tokens) {
          // Existing user logged in - go to dashboard
          const tokens = (data as any).tokens
          localStorage.setItem('access_token', tokens.access_token)
          localStorage.setItem('refresh_token', tokens.refresh_token)
          localStorage.setItem('user_email', email)
          onNext(email, true)
        } else if ((data as any).requires_verification) {
          // New user - go to email verification
          onNext(email, false)
        } else {
          // Handle other success cases
          onNext(email, false)
        }
      } else {
        setError((data as any).message || 'Authentication failed')
      }
    } catch (err) {
      setError('Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl mx-auto p-8">
      {/* Centered Logo */}
      <div className="flex justify-center mb-4">
                <Image 
                           src="/assets/small-logo.svg" 
                           alt="Kilwa Logo" 
                           width={25} 
                           height={32}
                           className="object-contain"
                         />
             </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-semibold text-gray-900 mb-2">
          {userExists ? 'Enter your password' : 'Set your password'}
        </h1>
      </div>

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[16px] font-medium text-[#989898] mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder={userExists ? "Enter your password" : "Enter password"}
            value={password}
            onChange={handlePasswordChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg  bg-white text-gray-900 outline-none"
          />
        </div>

        {/* Password Requirements - only show for new users */}
        {!userExists && (
          <div className="space-y-2">
            <div className={`flex items-center text-sm ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
              <svg className={`w-4 h-4 mr-2 ${hasMinLength ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              At least 8 characters
            </div>
            
            <div className={`flex items-center text-sm ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
              <svg className={`w-4 h-4 mr-2 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              At least 1 number
            </div>
            
            <div className={`flex items-center text-sm ${hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
              <svg className={`w-4 h-4 mr-2 ${hasUpperCase ? 'text-green-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              At least 1 upper case letter
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full font-medium py-3 px-4 rounded-lg transition-colors bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
      </form>
    </div>
  )
}
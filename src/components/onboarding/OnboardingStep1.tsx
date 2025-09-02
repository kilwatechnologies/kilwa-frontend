import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep1Props {
  onNext: (email: string, skipOnboarding?: boolean) => void
  onBack: () => void
  email: string
  userExists: boolean
}

export default function OnboardingStep1({ onNext, onBack, email, userExists }: OnboardingStep1Props) {
  const [password, setPassword] = useState('')
  const [hasMinLength, setHasMinLength] = useState(false)
  const [hasNumber, setHasNumber] = useState(false)
  const [hasUpperCase, setHasUpperCase] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    
    // Check password requirements
    setHasMinLength(value.length >= 8)
    setHasNumber(/\d/.test(value))
    setHasUpperCase(/[A-Z]/.test(value))
  }

  const isValid = userExists ? password.length > 0 : (hasMinLength && hasNumber && hasUpperCase)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (userExists && data.tokens) {
          // Existing user logged in - go to dashboard
          localStorage.setItem('access_token', data.tokens.access_token)
          localStorage.setItem('refresh_token', data.tokens.refresh_token)
          onNext(email, true)
        } else if (data.requires_verification) {
          // New user - go to email verification
          onNext(email, false)
        }
      } else {
        setError(data.message || 'Authentication failed')
      }
    } catch (err) {
      setError('Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8">
      {/* Centered Logo */}
      <div className="flex justify-center mb-8">
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {userExists ? 'Enter your password' : 'Set your password'}
        </h1>
      </div>

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder={userExists ? "Enter your password" : "Create password"}
            value={password}
            onChange={handlePasswordChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            required
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
          disabled={!isValid || loading}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
            isValid && !loading
              ? 'bg-gray-900 hover:bg-gray-800 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
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
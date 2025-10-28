'use client'

import { useState } from 'react'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface OnboardingVerifyEmailProps {
  onNext: (skipOnboarding?: boolean) => void
  onBack: () => void
  email: string
}

export default function OnboardingVerifyEmail({ onNext, onBack, email }: OnboardingVerifyEmailProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter the 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: fullCode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store tokens in localStorage if provided
        if (data.tokens) {
          localStorage.setItem('access_token', data.tokens.access_token)
          localStorage.setItem('refresh_token', data.tokens.refresh_token)
        }

        // Store user email if provided
        if (data.user?.email) {
          localStorage.setItem('user_email', data.user.email)
        }

        if (data.user?.skip_onboarding === true) {
          // Existing user - go to dashboard
          onNext(true)
        } else {
          // New user - continue to onboarding (goals screen)
          onNext(false)
        }
      } else {
        setError(data.message || 'Invalid verification code')
      }
    } catch (err) {
      setError('Failed to verify email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      setError('')

      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage('A new verification code has been sent to your email.')
        setError('')
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setError(data.message || 'Failed to resend code')
        setSuccessMessage('')
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.')
    }
  }

  return (
    <div className="p-8 w-full max-w-md bg-white rounded-xl flex flex-col">
 

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-8">
             <div className="flex justify-center mb-4">
                            <Image 
                                       src="/assets/small-logo.svg" 
                                       alt="Kilwa Logo" 
                                       width={25} 
                                       height={32}
                                       className="object-contain"
                                     />
                         </div>
            <h1 className="text-[32px] font-semibold text-gray-900 mb-2">
              Verify your email
            </h1>
            <p className="text-[#989898]">
              Enter the 6 digit code sent to <span className='text-[#686868]'>{email}</span>
              <br />
              within the next 30 minutes.
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              {/* Six separate input boxes */}
              <div className="flex justify-center space-x-3 mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value.replace(/\D/g, '')
                      if (value.length <= 1) {
                        const newCode = [...code]
                        newCode[index] = value
                        setCode(newCode)
                        
                        // Auto-focus next input
                        if (value && index < 5) {
                          const nextInput = document.getElementById(`code-${index + 1}`)
                          nextInput?.focus()
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to go to previous input
                      if (e.key === 'Backspace' && !code[index] && index > 0) {
                        const prevInput = document.getElementById(`code-${index - 1}`)
                        prevInput?.focus()
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault()
                      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                      const newCode = ['', '', '', '', '', '']
                      for (let i = 0; i < pastedData.length; i++) {
                        newCode[i] = pastedData[i]
                      }
                      setCode(newCode)
                    }}
                    id={`code-${index}`}
                    className="w-12 h-12 border border-gray-300 rounded-lg bg-white text-gray-900 text-center text-xl font-medium outline-none"
                    maxLength={1}
                  />
                ))}
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
              )}
              {successMessage && (
                <p className="mt-2 text-sm text-green-600 text-center">{successMessage}</p>
              )}
            </div>

            {/* Resend Code */}
            <div className="text-center">
              <span className="text-[#989898]">Didn't receive code? </span>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-black font-medium hover:underline"
              >
                Resend
              </button>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
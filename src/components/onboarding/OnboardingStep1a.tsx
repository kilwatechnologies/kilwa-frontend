import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep1aProps {
  onNext: (firstName: string, lastName: string) => void
  onBack: () => void
  email: string
}

export default function OnboardingStep1a({ onNext, onBack, email }: OnboardingStep1aProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName.trim()) {
      setError('Please enter your first name')
      return
    }

    if (!lastName.trim()) {
      setError('Please enter your last name')
      return
    }

    onNext(firstName.trim(), lastName.trim())
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl mx-auto p-8 flex flex-col" style={{ minHeight: '500px' }}>
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
      <div className="text-center mb-4">
        <h1 className="text-[32px] font-semibold text-gray-900 mb-2">
          Personal Info
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="space-y-6 flex-1">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-[16px]  text-gray-400 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter First name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
              autoFocus
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-[16px] text-gray-400 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 bg-white"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">
            {error}
          </div>
        )}

        {/* Continue Button - Bottom aligned */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-medium transition-colors mt-8 bg-black hover:bg-gray-800 text-white"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

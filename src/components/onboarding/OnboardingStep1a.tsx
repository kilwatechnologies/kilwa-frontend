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

  const isValid = firstName.trim().length > 0 && lastName.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onNext(firstName.trim(), lastName.trim())
  }

  return (
    <div className="w-full max-w-md bg-white rounded-xl mx-auto p-8">
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
          Personal Info
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
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
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
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

        {/* Continue Button */}
        <button
          type="submit"
          disabled={!isValid}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isValid
              ? 'bg-gray-900 hover:bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </form>
    </div>
  )
}

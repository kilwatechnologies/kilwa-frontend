import Image from 'next/image'
import { useState, useRef } from 'react'

interface OnboardingStep1bProps {
  onNext: (profilePicture: string | null) => void
  onBack: () => void
  email: string
}

export default function OnboardingStep1b({ onNext, onBack, email }: OnboardingStep1bProps) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicture(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSkip = () => {
    onNext(null)
  }

  const handleContinue = () => {
    onNext(profilePicture)
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
          Set your profile picture
        </h1>
        <p className="text-gray-600 text-sm">
          Upload a profile picture to personalize your account
        </p>
      </div>

      {/* Profile Picture Display */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleUploadClick}
          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
        >
          Add profile picture
        </button>

        {profilePicture ? (
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}

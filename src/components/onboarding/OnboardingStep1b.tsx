import Image from 'next/image'
import { useState, useRef } from 'react'

interface OnboardingStep1bProps {
  onNext: (profilePicture: string | null, blobName: string | null) => void
  onBack: () => void
  email: string
}

export default function OnboardingStep1b({ onNext, onBack, email }: OnboardingStep1bProps) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [blobName, setBlobName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicture(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/upload/profile-picture`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success && data.public_url) {
        setUploadedUrl(data.public_url)
        setBlobName(data.blob_name)
      } else {
        alert('Failed to upload image. Please try again.')
        setProfilePicture(null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
      setProfilePicture(null)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleSkip = () => {
    onNext(null, null)
  }

  const handleContinue = () => {
    // Pass the uploaded URL and blob name
    onNext(uploadedUrl, blobName)
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
          Set your profile picture
        </h1>
        <p className="text-gray-600 text-sm px-4 ">
         Make your profile stand out by adding a picture! Upload a clear, high-quality image of yourself to personalize your account.
        </p>
      </div>

      {/* Profile Picture Display */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-gray-100">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src="/assets/placeholder-image.svg"
              alt="Profile placeholder"
              width={128}
              height={128}
              className="object-contain"
            />
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
          disabled={uploading}
          className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Add profile picture'}
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
            className="w-full py-3 text-[#686868] hover:text-gray-900 font-medium transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}

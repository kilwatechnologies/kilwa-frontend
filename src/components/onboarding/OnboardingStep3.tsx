import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep3Props {
  onNext: () => void
  onBack: () => void
}

export default function OnboardingStep3({ onNext, onBack }: OnboardingStep3Props) {
  const [selectedCountry, setSelectedCountry] = useState('Select your country')
  const [selectedIndustry, setSelectedIndustry] = useState('Select your industry')

  const countries = [
    'Select your country',
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Canada',
    'Australia',
    'Singapore',
    'South Africa',
    'Other'
  ]

  const industries = [
    'Select your industry',
    'Financial Services',
    'Technology',
    'Healthcare',
    'Energy & Resources',
    'Manufacturing',
    'Real Estate',
    'Consulting',
    'Government',
    'Education',
    'Other'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedCountry && selectedIndustry && selectedCountry !== 'Select your country' && selectedIndustry !== 'Select your industry') {
      onNext()
    }
  }

  const isValid = selectedCountry && selectedIndustry && selectedCountry !== 'Select your country' && selectedIndustry !== 'Select your industry'

  return (
    <div className="w-full max-w-md mx-auto rounded-xl bg-white p-8">
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
          Tell us a bit about yourself.
        </h1>
        <p className="text-gray-600 text-sm">
          We'll recommend how you can make the most out of your Kilwa account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Country Dropdown */}
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none bg-white"
            required
          >
            {countries.map((country) => (
              <option key={country} value={country} disabled={country === 'Select your country'}>
                {country}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Industry Dropdown */}
        <div className="relative">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none bg-white"
            required
          >
            {industries.map((industry) => (
              <option key={industry} value={industry} disabled={industry === 'Select your industry'}>
                {industry}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
              isValid 
                ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
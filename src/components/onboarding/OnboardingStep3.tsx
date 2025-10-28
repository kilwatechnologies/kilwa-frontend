import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep3Props {
  onNext: (jobTitle: string, industry: string, country: string) => void
  onBack: () => void
  email: string
}

export default function OnboardingStep3({ onNext, onBack, email }: OnboardingStep3Props) {
  const [selectedCountry, setSelectedCountry] = useState('Select your country')
  const [selectedIndustry, setSelectedIndustry] = useState('Select your industry')
  const [jobTitle, setJobTitle] = useState('Select your job title')
  const [error, setError] = useState('')

  const jobTitles = [
    'Select your job title',
    'CEO',
    'CFO',
    'CTO',
    'Managing Director',
    'Director',
    'Senior Manager',
    'Manager',
    'Investment Analyst',
    'Financial Analyst',
    'Portfolio Manager',
    'Consultant',
    'Advisor',
    'Researcher',
    'Entrepreneur',
    'Student',
    'Other'
  ]

  const countries = [
    'Select your country',
    'Nigeria',
    'Ghana',
    'Kenya',
    'South Africa',
    'Egypt',
    'Morocco',
    'Ethiopia',
    'Tanzania',
    'Botswana',
    'Rwanda',
    'Tunisia',
    'Mauritius'
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
    setError('')

    if (selectedCountry === 'Select your country') {
      setError('Please select your country')
      return
    }

    if (selectedIndustry === 'Select your industry') {
      setError('Please select your industry')
      return
    }

    if (jobTitle === 'Select your job title') {
      setError('Please select your job title')
      return
    }

    onNext(jobTitle, selectedIndustry, selectedCountry)
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-xl bg-white p-8">
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
        <h1 className="text-[32px] font-semibold text-gray-900 mb-2 leading-[120%]">
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
            className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg  outline-none appearance-none bg-white"
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
            className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg outline-none appearance-none bg-white"
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

                {/* Job Title Dropdown */}
        <div className="relative">
          <select
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg outline-none appearance-none bg-white"
          >
            {jobTitles.map((title) => (
              <option key={title} value={title} disabled={title === 'Select your job title'}>
                {title}
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
            className="w-full font-medium py-3 px-4 rounded-lg transition-colors bg-gray-900 hover:bg-gray-800 text-white"
          >
            Continue
          </button>

          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>
      </form>
    </div>
  )
}
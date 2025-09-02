import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep4Props {
  onNext: () => void
  onBack: () => void
}

export default function OnboardingStep4({ onNext, onBack }: OnboardingStep4Props) {
  const [isiThreshold, setIsiThreshold] = useState('50')
  const [metiTiming, setMetiTiming] = useState('Optimal Entry')
  const [newsSpikes, setNewsSpikes] = useState(true)
  const [weeklySummaries, setWeeklySummaries] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
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
          Would you like to set up alerts?
        </h1>
        <p className="text-gray-600 text-sm">
          Receive notifications when key indicators change.
        </p>
      </div>

      {/* Alerts Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ISI Threshold Alert */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={true}
              onChange={() => {}}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black mr-3"
            />
            <span className="text-gray-900">Notify when ISI drops below</span>
          </div>
          <select
            value={isiThreshold}
            onChange={(e) => setIsiThreshold(e.target.value)}
            className="ml-2 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-black focus:border-black"
          >
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
            <option value="60">60</option>
            <option value="70">70</option>
          </select>
        </div>

        {/* METI Timing Alert */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={true}
              onChange={() => {}}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black mr-3"
            />
            <span className="text-gray-900">Alert me when METI shifts to</span>
          </div>
          <select
            value={metiTiming}
            onChange={(e) => setMetiTiming(e.target.value)}
            className="ml-2 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-black focus:border-black"
          >
            <option value="Early Entry">Early Entry</option>
            <option value="Optimal Entry">Optimal Entry</option>
            <option value="Late Entry">Late Entry</option>
            <option value="Exit">Exit</option>
          </select>
        </div>

        {/* News Sentiment Spikes */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={newsSpikes}
            onChange={(e) => setNewsSpikes(e.target.checked)}
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black mr-3"
          />
          <span className="text-gray-900">Send me news sentiment spikes</span>
        </div>

        {/* Weekly Summaries */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={weeklySummaries}
            onChange={(e) => setWeeklySummaries(e.target.checked)}
            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black mr-3"
          />
          <span className="text-gray-900">Email me weekly summaries</span>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
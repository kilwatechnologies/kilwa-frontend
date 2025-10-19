import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep4Props {
  onNext: () => void
  onBack: () => void
}

export default function OnboardingStep4({ onNext, onBack }: OnboardingStep4Props) {
  const [isiThreshold, setIsiThreshold] = useState('50')
  const [metiTiming, setMetiTiming] = useState('Optimal Entry')
  const [newsSpikes, setNewsSpikes] = useState(false)
  const [weeklySummaries, setWeeklySummaries] = useState(false)
  const [isiAlerts, setIsiAlerts] = useState(false)
  const [metiAlerts, setMetiAlerts] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl p-8">
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
        <h1 className="text-[32px] font-semibold text-gray-900 mb-2">
          Would you like to <br/> set up alerts?
        </h1>
        <p className="text-gray-600 text-[16px]">
          Receive notifications when key <br/> indicators change.
        </p>
      </div>

      {/* Alerts Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ISI Threshold Alert */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-[15px]">
            <button
              type="button"
              onClick={() => setIsiAlerts(!isiAlerts)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                isiAlerts ? 'bg-black' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isiAlerts ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-gray-900">Notify when ISI drops below</span>
          </div>
          <div className="relative">
            <select
              value={isiThreshold}
              onChange={(e) => setIsiThreshold(e.target.value)}
              className="px-3 py-1 pr-8 border border-gray-300 bg-white text-gray-900 rounded-2xl text-sm focus:ring-black focus:border-black appearance-none"
              disabled={!isiAlerts}
            >
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="60">60</option>
              <option value="70">70</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* METI Timing Alert */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-[15px]">
            <button
              type="button"
              onClick={() => setMetiAlerts(!metiAlerts)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                metiAlerts ? 'bg-black' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  metiAlerts ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="ml-3 text-gray-900">Alert me when METI shifts to</span>
          </div>
          <div className="relative">
            <select
              value={metiTiming}
              onChange={(e) => setMetiTiming(e.target.value)}
              className="px-3 py-1 pr-8 border border-gray-300 bg-white text-gray-900 rounded-2xl text-sm focus:ring-black focus:border-black appearance-none"
              disabled={!metiAlerts}
            >
              <option value="Early Entry">Early Entry</option>
              <option value="Optimal Entry">Optimal Entry</option>
              <option value="Late Entry">Late Entry</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* News Sentiment Spikes */}
        <div className="flex items-center text-[15px]">
          <button
            type="button"
            onClick={() => setNewsSpikes(!newsSpikes)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              newsSpikes ? 'bg-black' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                newsSpikes ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-3 text-gray-900">Send me news sentiment spikes</span>
        </div>

        {/* Weekly Summaries */}
        <div className="flex items-center text-[15px]">
          <button
            type="button"
            onClick={() => setWeeklySummaries(!weeklySummaries)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
              weeklySummaries ? 'bg-black' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                weeklySummaries ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-3 text-gray-900">Email me weekly alerts</span>
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
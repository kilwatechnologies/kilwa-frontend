import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep2Props {
  onNext: () => void
  onBack: () => void
}

export default function OnboardingStep2({ onNext, onBack }: OnboardingStep2Props) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['macroeconomic', 'news'])

  const goals = [
    { id: 'macroeconomic', label: 'Track macroeconomic risk' },
    { id: 'political', label: 'Monitor political & regulatory shifts' },
    { id: 'timing', label: 'Find best times to enter a market' },
    { id: 'news', label: 'Analyze news & sentiment trends' },
  ]

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8">
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
          Let's tailor Kilwa to your goals
        </h1>
        <p className="text-gray-600 text-sm">
          Select your primary markets to tailor a dashboard that aligns with your trading focus.
        </p>
      </div>

      {/* Goals Selection */}
      <form onSubmit={handleSubmit} className=" space-y-4">
        {goals.map((goal) => (
          <label 
            key={goal.id}
            className="flex pl-4 items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedGoals.includes(goal.id)}
              onChange={() => toggleGoal(goal.id)}
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black"
            />
            <span className="ml-3 text-gray-900">{goal.label}</span>
          </label>
        ))}
        
        <div className="pt-8">
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
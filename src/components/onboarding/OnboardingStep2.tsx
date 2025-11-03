import Image from 'next/image'
import { useState } from 'react'
import { authApi } from '@/lib/api'

interface OnboardingStep2Props {
  onNext: () => void
  onBack: () => void
}

export default function OnboardingStep2({ onNext, onBack }: OnboardingStep2Props) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const goals = [
    { id: 'macroeconomic', label: 'Track macroeconomic risk' },
    { id: 'political', label: 'Monitor political & regulatory shifts' },
    { id: 'timing', label: 'Find optimal times to enter a market' },
    { id: 'news', label: 'Analyze news & sentiment trends' },
  ]

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Save preferences before moving to next step
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        // Map goal IDs to the format backend expects
        const goalMapping: Record<string, string> = {
          'macroeconomic': 'macroeconomic',
          'political': 'political',
          'timing': 'optimalTimes',
          'news': 'sentiment'
        }

        // Convert selected goals to array of mapped names
        const mappedGoals = selectedGoals.map(goal => goalMapping[goal] || goal)

        const preferencesData = {
          selected_goals: mappedGoals
        }
        console.log('Saving preferences:', preferencesData)
        console.log('Selected goals array:', selectedGoals)
        await authApi.updatePreferences(preferencesData, token)
        console.log('Preferences saved successfully')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      // Continue to next step even if save fails
    }

    onNext()
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
         Customize Kilwa to <br/>your needs
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
              className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black cursor-pointer"
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
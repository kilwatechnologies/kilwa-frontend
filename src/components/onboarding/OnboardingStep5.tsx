import Image from 'next/image'
import { useState } from 'react'

interface OnboardingStep5Props {
  onComplete: () => void
  onBack: () => void
}

export default function OnboardingStep5({ onComplete, onBack }: OnboardingStep5Props) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: '/assets/card1.svg',
      price: { monthly: 0, yearly: 0 },
      description: 'Best For: General public Journalists & Researchers',
      subDescription: 'Basic ISI access, 3 country dashboards, alerts for 1 sector',
      features: [
        'Basic ISI Scores',
        'Top-10 Rankings', 
        'Visual Maps',
        'Email Newsletters'
      ],
      buttonText: 'Subscribe',
      buttonStyle: 'bg-gray-900 text-white'
    },
    {
      id: 'gold',
      name: 'Gold',
      icon: '/assets/card2.svg',
      price: { monthly: 699, yearly: 599 },
      description: 'All features, 15 countries, full dashboard access, export tools',
      subDescription: 'Best for: Analysts, boutique investors, consultants',
      features: [
        'Basic ISI Scores',
        'Top-10 Rankings',
        'Visual Maps', 
        'Email Newsletters'
      ],
      buttonText: 'Subscribe',
      buttonStyle: 'bg-white text-gray-900',
      highlighted: true
    },
    {
      id: 'platinum',
      name: 'Platinum',
      icon: '/assets/card1.svg',
      price: { monthly: 299, yearly: 249 },
      description: 'All features, 15 countries, full dashboard access, export tools',
      subDescription: 'Best for: Analysts, boutique investors, consultants',
      features: [
        'Basic ISI Scores',
        'Top-10 Rankings',
        'Visual Maps',
        'Email Newsletters'
      ],
      buttonText: 'Subscribe',
      buttonStyle: 'bg-gray-900 text-white'
    }
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    onComplete()
  }

  return (
    <div className="min-h-screen  p-6">
      {/* Header */}
      <div className="text-center py-8">
      
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Unlock Full Access to Kilwa
        </h1>
        <p className="text-gray-600">
          Real-time insights on ISI, METI, FDI & market forecasts all in one dashboard.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-200 rounded-lg p-1 flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'yearly' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative shadow-xl border rounded-xl p-6 ${
              plan.highlighted ? 'border-gray-900 bg-gray-900 text-white' : 'bg-white border-gray-200'
            }`}
          >
            {/* Icon */}
            <div className="mb-4">
              <Image 
                src={plan.icon} 
                alt={`${plan.name} plan icon`} 
                width={24} 
                height={24}
                className="object-contain"
              />
            </div>
            
            {/* Plan Name & Price */}
            <div className="flex justify-between items-center mb-4 ">
              <h3 className={`pt-2 text-xl font-semibold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <div className="mt-2">
                <span className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                  Starting at
                </span>
                <span className={`text-2xl font-bold ml-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  ${plan.price[billingPeriod]}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                  / mon
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                {plan.description}
              </p>
              <p className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                {plan.subDescription}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center">
                  {(plan.id === 'free' || plan.id === 'platinum') ? (
                    <svg className={`w-4 h-4 mr-2 ${plan.highlighted ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" strokeWidth="1.5" />
                      <path d="M6.5 10.5l2.5 2.5 5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={`text-sm mr-2 ${plan.highlighted ? 'text-gray-300' : 'text-gray-400'}`}>+</span>
                  )}
                  <span className={`text-sm ${plan.highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Subscribe Button */}
            <button
              onClick={() => handlePlanSelect(plan.id)}
              className={`w-full py-3 px-4 rounded-full font-medium transition-colors ${plan.buttonStyle}`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Options */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advisory */}
        <div className="text-center p-6 border bg-gray-100 border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-gray-900 rounded flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Advisory</h3>
          <p className="text-sm text-gray-600 mb-4">
            Reports, briefings, 54 countries, analyst reports & priority SLA
          </p>
          <button className="text-gray-900 underline font-medium">
            Contact sales
          </button>
        </div>

        {/* Enterprise */}
        <div className="text-center p-6 border bg-gray-100 border-gray-200 rounded-lg">
          <div className="w-12 h-12 bg-gray-900 rounded flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
          <p className="text-sm text-gray-600 mb-4">
            API access, team accounts, 54 countries, analyst reports
          </p>
          <button className="text-gray-900 underline font-medium">
            Contact sales
          </button>
        </div>
      </div>
    </div>
  )
}
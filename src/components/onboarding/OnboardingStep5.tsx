import Image from 'next/image'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

interface OnboardingStep5Props {
  onComplete: () => void
  onBack: () => void
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function OnboardingStep5({ onComplete, onBack }: OnboardingStep5Props) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)


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
      id: 'diamond',
      name: 'Diamond',
      icon: '/assets/card1.svg',
      price: { monthly: 2499, yearly: 24999 },
      description: 'All features, 15 countries, full dashboard access, export tools',
      subDescription: 'Best for: Investment Teams & Corporations',
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

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId)
    setError(null)

    // Free plan - no payment needed
    if (planId === 'free') {
      onComplete()
      return
    }

    // Advisory and Enterprise - contact sales
    if (planId === 'advisory' || planId === 'enterprise') {
      // TODO: Redirect to contact sales page or show modal
      alert('Please contact sales for Advisory and Enterprise plans')
      return
    }

    // Paid plans (Gold, Diamond) - redirect to Stripe Checkout
    try {
      setLoading(true)

      // Get access token from localStorage
      const accessToken = localStorage.getItem('access_token')

      if (!accessToken) {
        throw new Error('User not authenticated. Please log in again.')
      }

      // First, get user details to retrieve user_id
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!userResponse.ok) {
        throw new Error('Failed to get user information')
      }

      const userData = await userResponse.json()
      const userId = userData.user?.id

      if (!userId) {
        throw new Error('Could not retrieve user ID')
      }

      // Call backend to create checkout session
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          user_id: userId,
          plan_type: planId,
          billing_period: billingPeriod,
          success_url: `${window.location.origin}/dashboard?payment=success`,
          cancel_url: `${window.location.origin}/onboarding/step-5?payment=canceled`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to create checkout session')
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.data.checkout_url

    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message || 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen  p-6">
      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

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
              disabled={loading && selectedPlan === plan.id}
              className={`w-full py-3 px-4 rounded-full font-medium transition-colors ${plan.buttonStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && selectedPlan === plan.id ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                plan.buttonText
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Options */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advisory */}
        <div className="flex flex-col items-start space-y-3 p-6 border bg-gray-100 border-gray-200 rounded-lg">
          <Image 
                src='/assets/advisory.svg' 
                alt='advisorypic' 
                width={40} 
                height={40}
                className="object-contain"
              />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Advisory</h3>
          <p className="text-sm text-gray-600 mb-4">
            Reports, briefings, 54 countries, analyst reports & priority SLA
          </p>
          <button className="text-gray-900 underline font-medium">
            Contact sales
          </button>
        </div>

        {/* Enterprise */}
        <div className="flex flex-col items-start space-y-3 p-6 border bg-gray-100 border-gray-200 rounded-lg">
         <Image 
                src='/assets/enterprise.svg' 
                alt='advisorypic' 
                width={40} 
                height={40}
                className="object-contain"
              />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h3>
          <p className="text-sm text-gray-600 mb-4">
            API access, team accounts, 54 countries, analyst reports
          </p>
          <button className="text-gray-900  underline font-medium">
            Contact sales
          </button>
        </div>
      </div>
    </div>
  )
}
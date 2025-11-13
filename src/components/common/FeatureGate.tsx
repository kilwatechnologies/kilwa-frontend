/**
 * FeatureGate Component
 * Conditionally renders content based on user's plan features
 */

import { ReactNode } from 'react'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import Link from 'next/link'

interface FeatureGateProps {
  userPlan: string
  requiredFeature: keyof ReturnType<typeof usePlanFeatures>['features']
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  children: ReactNode
}

export function FeatureGate({
  userPlan,
  requiredFeature,
  fallback,
  showUpgradePrompt = true,
  children
}: FeatureGateProps) {
  const { features, getUpgradeMessage } = usePlanFeatures(userPlan)

  // Check if user has the required feature
  const hasAccess = features[requiredFeature]

  if (hasAccess) {
    return <>{children}</>
  }

  // If no access, show fallback or upgrade prompt
  if (fallback) {
    return <>{fallback}</>
  }

  if (showUpgradePrompt) {
    const featureName = requiredFeature
      .replace(/^has/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim()

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
        <div className="max-w-md mx-auto">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {featureName} Locked
          </h3>
          <p className="text-gray-600 mb-4">
            {getUpgradeMessage(featureName)}
          </p>
          <Link
            href="/onboarding/step-5?returnTo=dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    )
  }

  return null
}

/**
 * Inline Feature Lock Badge
 * Shows a small lock icon for locked features
 */
interface FeatureLockBadgeProps {
  userPlan: string
  requiredFeature: keyof ReturnType<typeof usePlanFeatures>['features']
  onClick?: () => void
}

export function FeatureLockBadge({
  userPlan,
  requiredFeature,
  onClick
}: FeatureLockBadgeProps) {
  const { features } = usePlanFeatures(userPlan)
  const hasAccess = features[requiredFeature]

  if (hasAccess) return null

  return (
    <button
      onClick={onClick || (() => window.location.href = '/onboarding/step-5?returnTo=dashboard')}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition-colors"
      title="Upgrade to unlock this feature"
    >
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
          clipRule="evenodd"
        />
      </svg>
      Upgrade
    </button>
  )
}

/**
 * Disabled Feature Wrapper
 * Grays out and disables features that aren't available in the user's plan
 */
interface DisabledFeatureWrapperProps {
  userPlan: string
  requiredFeature: keyof ReturnType<typeof usePlanFeatures>['features']
  children: ReactNode
  tooltip?: string
}

export function DisabledFeatureWrapper({
  userPlan,
  requiredFeature,
  children,
  tooltip
}: DisabledFeatureWrapperProps) {
  const { features, getUpgradeMessage } = usePlanFeatures(userPlan)
  const hasAccess = features[requiredFeature]

  if (hasAccess) {
    return <>{children}</>
  }

  const featureName = requiredFeature
    .replace(/^has/, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none blur-sm select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg px-4 py-2 text-center max-w-xs">
          <svg
            className="w-6 h-6 mx-auto mb-2 text-amber-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-1">
            {tooltip || getUpgradeMessage(featureName)}
          </p>
          <Link
            href="/onboarding/step-5?returnTo=dashboard"
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  )
}

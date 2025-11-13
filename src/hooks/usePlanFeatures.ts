/**
 * Plan Features Hook
 * Centralized logic for checking user plan features and permissions
 */

export type PlanType = 'free' | 'gold' | 'diamond' | 'enterprise'

export interface PlanFeatures {
  // Core Features
  hasInteractiveDashboard: boolean
  hasBasicISI: boolean
  hasDailyISI: boolean
  hasRealtimeISI: boolean
  hasMETI: boolean
  hasSentimentPulse: boolean
  hasNLGNarrative: boolean

  // Access Features
  hasAPIAccess: boolean
  hasHighVolumeAPI: boolean
  hasDataExport: boolean
  hasCustomReports: boolean
  hasCustomModels: boolean

  // Support & Limits
  maxCountries: number | null  // null = unlimited
  maxUsers: number | null      // null = unlimited
  supportLevel: 'community' | 'priority' | 'dedicated' | 'dedicated-manager'

  // Plan Info
  planType: PlanType
  planDisplayName: string
}

/**
 * Get feature permissions based on plan type
 */
export function getPlanFeatures(planType: string = 'free'): PlanFeatures {
  const plan = planType.toLowerCase() as PlanType

  switch (plan) {
    case 'free':
      return {
        hasInteractiveDashboard: true,
        hasBasicISI: true,
        hasDailyISI: false,
        hasRealtimeISI: false,
        hasMETI: false,
        hasSentimentPulse: false,
        hasNLGNarrative: false,
        hasAPIAccess: false,
        hasHighVolumeAPI: false,
        hasDataExport: false,
        hasCustomReports: false,
        hasCustomModels: false,
        maxCountries: 3,
        maxUsers: 1,
        supportLevel: 'community',
        planType: 'free',
        planDisplayName: 'Free'
      }

    case 'gold':
      return {
        hasInteractiveDashboard: true,
        hasBasicISI: false,
        hasDailyISI: true,
        hasRealtimeISI: false,
        hasMETI: true,
        hasSentimentPulse: true,
        hasNLGNarrative: true,
        hasAPIAccess: false,
        hasHighVolumeAPI: false,
        hasDataExport: false,
        hasCustomReports: false,
        hasCustomModels: false,
        maxCountries: null,  // All countries
        maxUsers: 1,
        supportLevel: 'priority',
        planType: 'gold',
        planDisplayName: 'Gold'
      }

    case 'diamond':
      return {
        hasInteractiveDashboard: true,
        hasBasicISI: false,
        hasDailyISI: false,
        hasRealtimeISI: true,
        hasMETI: true,
        hasSentimentPulse: true,
        hasNLGNarrative: true,
        hasAPIAccess: true,
        hasHighVolumeAPI: false,
        hasDataExport: true,
        hasCustomReports: true,
        hasCustomModels: false,
        maxCountries: null,  // All countries
        maxUsers: 5,
        supportLevel: 'dedicated',
        planType: 'diamond',
        planDisplayName: 'Diamond'
      }

    case 'enterprise':
      return {
        hasInteractiveDashboard: true,
        hasBasicISI: false,
        hasDailyISI: false,
        hasRealtimeISI: true,
        hasMETI: true,
        hasSentimentPulse: true,
        hasNLGNarrative: true,
        hasAPIAccess: true,
        hasHighVolumeAPI: true,
        hasDataExport: true,
        hasCustomReports: true,
        hasCustomModels: true,
        maxCountries: null,  // All countries
        maxUsers: null,      // Unlimited
        supportLevel: 'dedicated-manager',
        planType: 'enterprise',
        planDisplayName: 'Enterprise'
      }

    default:
      // Default to free plan if unknown
      return getPlanFeatures('free')
  }
}

/**
 * Custom hook for using plan features in components
 */
export function usePlanFeatures(userPlan: string = 'free') {
  const features = getPlanFeatures(userPlan)

  /**
   * Check if user has access to a specific feature
   */
  const hasFeature = (featureName: keyof Omit<PlanFeatures, 'planType' | 'planDisplayName' | 'maxCountries' | 'maxUsers' | 'supportLevel'>): boolean => {
    return features[featureName] === true
  }

  /**
   * Check if user can access a specific number of countries
   */
  const canAccessCountries = (requestedCountries: number): boolean => {
    if (features.maxCountries === null) return true  // Unlimited
    return requestedCountries <= features.maxCountries
  }

  /**
   * Check if user can add more team members
   */
  const canAddUsers = (currentUsers: number): boolean => {
    if (features.maxUsers === null) return true  // Unlimited
    return currentUsers < features.maxUsers
  }

  /**
   * Get upgrade prompt message for a feature
   */
  const getUpgradeMessage = (featureName: string): string => {
    const planMap: Record<PlanType, string> = {
      free: 'Gold',
      gold: 'Diamond',
      diamond: 'Enterprise',
      enterprise: 'Enterprise'  // Already on highest plan
    }

    const nextPlan = planMap[features.planType]
    return `Upgrade to ${nextPlan} plan to unlock ${featureName}`
  }

  return {
    features,
    hasFeature,
    canAccessCountries,
    canAddUsers,
    getUpgradeMessage
  }
}

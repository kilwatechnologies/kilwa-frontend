import { authApi, countriesApi } from './api'
import { saveCountryPreference } from './countryPreference'

export interface UserData {
  email: string
  firstName: string
  lastName: string
  profilePicture?: string
  userPlan?: string
}

/**
 * Load user data from localStorage and API
 */
export const loadUserData = async (): Promise<UserData> => {
  const email = localStorage.getItem('user_email') || localStorage.getItem('userEmail') || 'user@example.com'

  const token = localStorage.getItem('access_token')
  if (token) {
    try {
      const response = await authApi.getCurrentUser(token)

      // Handle both response.data.user and response.data.data.user
      const responseData: any = response.data
      const userData = responseData.user || responseData.data?.user

      if (userData) {
        // Save country preference to localStorage if user has a country set
        if (userData.country) {
          try {
            const countriesResponse = await countriesApi.getAfricanCountries()
            if (countriesResponse.data.success && countriesResponse.data.data) {
              const selectedCountry = countriesResponse.data.data.find(
                (c: any) => c.name === userData.country
              )
              if (selectedCountry) {
                saveCountryPreference({
                  id: selectedCountry.id,
                  name: selectedCountry.name,
                  isoCode: selectedCountry.isoCode
                })
                console.log('Country preference synced from user profile:', selectedCountry.name)
              }
            }
          } catch (error) {
            console.error('Failed to sync country preference:', error)
          }
        }

        return {
          email,
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          profilePicture: userData.profile_picture || '',
          userPlan: userData.subscription_plan || 'free'
        }
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error)

      // If token is invalid/expired (401), clear localStorage and redirect
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, clearing session...')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_email')
        localStorage.removeItem('userEmail')

        // Redirect to login if not already there
        if (typeof window !== 'undefined' &&
            !window.location.pathname.includes('/auth') &&
            !window.location.pathname.includes('/onboarding')) {
          window.location.href = '/'
        }
      }
    }
  } else {
    // No token found, redirect to login if not already there
    console.log('No access token found')
    if (typeof window !== 'undefined' &&
        !window.location.pathname.includes('/auth') &&
        !window.location.pathname.includes('/onboarding') &&
        window.location.pathname !== '/') {
      console.log('Redirecting to login...')
      window.location.href = '/'
    }
  }

  return { email, firstName: '', lastName: '', profilePicture: '', userPlan: 'free' }
}

/**
 * Get formatted name: "FirstName L." or fallback to email username
 */
export const getFormattedName = (userData: UserData): string => {
  // Use first name + first letter of last name if available
  if (userData.firstName && userData.lastName) {
    return `${userData.firstName} ${userData.lastName.charAt(0)}.`
  }
  // Fallback to just first name
  if (userData.firstName) {
    return userData.firstName
  }
  // Fallback to email-based username
  const username = getUsernameFromEmail(userData.email)
  return username.length > 5 ? username.slice(0, 5) + '...' : username
}

/**
 * Get user initials: "FL" or fallback to email initials
 */
export const getUserInitials = (userData: UserData): string => {
  // Use initials from first and last name if available
  if (userData.firstName && userData.lastName) {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase()
  }
  // Fallback to email-based initials
  return getInitialsFromEmail(userData.email)
}

/**
 * Extract username from email (part before @)
 */
export const getUsernameFromEmail = (email: string): string => {
  if (!email || !email.includes('@')) return 'User'
  const [localPart] = email.split('@')
  return localPart
}

/**
 * Get initials from email (first 2 characters)
 */
export const getInitialsFromEmail = (email: string): string => {
  if (!email || !email.includes('@')) return 'US'
  const [localPart] = email.split('@')
  return localPart.slice(0, 2).toUpperCase()
}

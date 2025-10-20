import { authApi } from './api'

export interface UserData {
  email: string
  firstName: string
  lastName: string
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
        return {
          email,
          firstName: userData.first_name || '',
          lastName: userData.last_name || ''
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  return { email, firstName: '', lastName: '' }
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

/**
 * Utility functions for managing user's preferred country across the app
 */

export interface CountryPreference {
  id: number
  name: string
  isoCode: string
}

const COUNTRY_PREFERENCE_KEY = 'preferred_country'

/**
 * Save the user's preferred country to localStorage
 */
export const saveCountryPreference = (country: CountryPreference) => {
  try {
    localStorage.setItem(COUNTRY_PREFERENCE_KEY, JSON.stringify(country))
  } catch (error) {
    console.error('Failed to save country preference:', error)
  }
}

/**
 * Get the user's preferred country from localStorage
 */
export const getCountryPreference = (): CountryPreference | null => {
  try {
    const stored = localStorage.getItem(COUNTRY_PREFERENCE_KEY)
    if (stored) {
      return JSON.parse(stored) as CountryPreference
    }
  } catch (error) {
    console.error('Failed to get country preference:', error)
  }
  return null
}

/**
 * Clear the user's preferred country from localStorage
 */
export const clearCountryPreference = () => {
  try {
    localStorage.removeItem(COUNTRY_PREFERENCE_KEY)
  } catch (error) {
    console.error('Failed to clear country preference:', error)
  }
}

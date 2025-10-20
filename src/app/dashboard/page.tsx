'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import CountryTreemap from '@/components/dashboard/CountryTreemap'
import { countriesApi, isiApi, metiApi, sentimentApi } from '@/lib/api'

interface Country {
  id: number
  name: string
  isoCode: string
  region?: string
  isiScore?: number
  metiScore?: number
  sentimentPulse?: string
}

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setFilters] = useState({})
  const [userEmail, setUserEmail] = useState<string>('')
  const [userFirstName, setUserFirstName] = useState<string>('')
  const [userLastName, setUserLastName] = useState<string>('')

  useEffect(() => {
    loadDashboardData()
    loadUserData()
  }, [])

  const loadUserData = async () => {
    // Get user email from localStorage
    const email = localStorage.getItem('user_email') || localStorage.getItem('userEmail') || 'user@example.com'
    setUserEmail(email)

    // Fetch user data from API to get first name and last name
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        const { authApi } = await import('@/lib/api')
        const response = await authApi.getCurrentUser(token)
        console.log('User data response:', response.data)

        // Handle both response.data.user and response.data.data.user (like settings page)
        const responseData: any = response.data
        const userData = responseData.user || responseData.data?.user

        if (userData) {
          setUserFirstName(userData.first_name || '')
          setUserLastName(userData.last_name || '')
          console.log('User name loaded:', userData.first_name, userData.last_name)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Starting API calls...')

      // Fetch countries data
      console.log('📡 Fetching countries data...')
      const countriesResponse = await countriesApi.getAfricanCountries()
      console.log('🌍 Countries API Response:', countriesResponse)
      
      if (countriesResponse.data.success && countriesResponse.data.data) {
        const countriesData = countriesResponse.data.data
        console.log('✅ Countries data received:', countriesData)
        
        // Fetch ISI scores for most recent available year (2022)
        const targetYear = 2022  // Use most recent year with complete data
        console.log(`📊 Fetching ISI scores for year ${targetYear}...`)
        const isiResponse = await isiApi.getScores(targetYear)
        console.log('📈 ISI API Response:', isiResponse)
        
        let isiScores: any[] = []
        if (isiResponse.data.success && isiResponse.data.data && isiResponse.data.data.length > 0) {
          isiScores = isiResponse.data.data
          console.log('✅ ISI scores received:', isiScores.length, 'records')
          console.log('📊 Sample ISI score:', isiScores[0])
        } else {
          console.log('⚠️ No ISI scores data received - might be missing from deployed DB')
          console.log('🎭 Using mock ISI scores for demonstration')
          // Use mock ISI scores when none available from API
          const mockScores = [
            { countryId: 1, score: 65.2 }, // Egypt
            { countryId: 2, score: 58.1 }, // Morocco  
            { countryId: 3, score: 62.4 }, // Tunisia
            { countryId: 4, score: 61.9 }, // Nigeria
            { countryId: 5, score: 68.2 }, // Ghana
            { countryId: 6, score: 69.3 }, // Kenya
            { countryId: 7, score: 71.8 }, // Rwanda
            { countryId: 8, score: 45.5 }, // South Africa
            { countryId: 9, score: 67.3 }, // Botswana
            { countryId: 10, score: 73.1 } // Mauritius
          ]
          isiScores = mockScores
          console.log('📝 Using mock ISI scores:', isiScores)
        }

        // Fetch METI scores for all countries
        console.log('📊 Fetching METI scores...')
        const metiPromises = countriesData.map(country =>
          metiApi.getScoresByCountry(country.id).catch(err => {
            console.log(`⚠️ METI fetch failed for ${country.name}:`, err)
            return null
          })
        )
        const metiResponses = await Promise.all(metiPromises)

        // Fetch sentiment data for all countries
        console.log('📊 Fetching sentiment data...')
        const sentimentPromises = countriesData.map(country =>
          sentimentApi.getNews(country.id, 7, 50).catch(err => {
            console.log(`⚠️ Sentiment fetch failed for ${country.name}:`, err)
            return null
          })
        )
        const sentimentResponses = await Promise.all(sentimentPromises)

        // Combine countries with their ISI scores, METI scores, and sentiment
        const countriesWithScores = countriesData.map((country, index) => {
          // ISI Score
          const isiScore = isiScores.find(score =>
            score.countryId === country.id || score.country_id === country.id
          )

          // METI Score
          let metiScore = undefined
          const metiResponse = metiResponses[index]
          if (metiResponse && metiResponse.data?.success && metiResponse.data?.data) {
            const scores = Array.isArray(metiResponse.data.data) ? metiResponse.data.data : [metiResponse.data.data]
            if (scores.length > 0) {
              metiScore = scores[0].score
            }
          }

          // Sentiment Pulse
          let sentimentPulse = 'Neutral'
          const sentimentResponse = sentimentResponses[index]
          if (sentimentResponse && sentimentResponse.data?.success && sentimentResponse.data?.data) {
            const articles = sentimentResponse.data.data
            if (articles.length > 0) {
              const positive = articles.filter((a: any) => a.sentiment_label === 'positive').length
              const negative = articles.filter((a: any) => a.sentiment_label === 'negative').length
              const neutral = articles.filter((a: any) => a.sentiment_label === 'neutral').length

              const max = Math.max(positive, neutral, negative)
              if (positive === max) sentimentPulse = 'Positive'
              else if (negative === max) sentimentPulse = 'Negative'
              else sentimentPulse = 'Neutral'
            }
          }

          console.log(`🔗 Mapping ${country.name} (ID: ${country.id}): ISI=${isiScore?.score || 'N/A'}, METI=${metiScore || 'N/A'}, Sentiment=${sentimentPulse}`)

          return {
            ...country,
            isoCode: country.isoCode || country.name.substring(0, 3).toUpperCase(),
            isiScore: isiScore ? isiScore.score : undefined,
            metiScore,
            sentimentPulse,
            region: getRegionFromCountry(country.name)
          }
        })

        console.log('🎯 Final countries with scores:', countriesWithScores)
        setCountries(countriesWithScores)
      } else {
        console.log('❌ Countries API failed or returned no data')
        setError('Failed to load countries data')
      }
    } catch (err) {
      console.error('❌ Dashboard API Error:', err)
      console.log('🔄 Falling back to mock data...')
      
      // Fallback to mock data for development
      const mockCountries = getMockCountries()
      console.log('🎭 Mock countries data:', mockCountries)
      setCountries(mockCountries)
      setError(null) // No error when using mock data
    } finally {
      setLoading(false)
    }
  }

  const getRegionFromCountry = (countryName: string): string => {
    const regions = {
      'North Africa': ['Egypt', 'Algeria', 'Morocco', 'Tunisia', 'Libya', 'Sudan'],
      'West Africa': ['Nigeria', 'Ghana', 'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Guinea', 'Sierra Leone', 'Liberia', 'Ivory Coast', 'Benin', 'Togo', 'Cape Verde', 'Gambia', 'Guinea-Bissau', 'Mauritania'],
      'East Africa': ['Ethiopia', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'Djibouti', 'Eritrea', 'Somalia', 'South Sudan'],
      'Central Africa': ['Cameroon', 'Central African Republic', 'Chad', 'Democratic Republic of Congo', 'Republic of Congo', 'Equatorial Guinea', 'Gabon', 'São Tomé and Príncipe'],
      'Southern Africa': ['South Africa', 'Zimbabwe', 'Zambia', 'Botswana', 'Namibia', 'Angola', 'Mozambique', 'Madagascar', 'Mauritius', 'Malawi', 'Lesotho', 'Eswatini', 'Comoros', 'Seychelles']
    }

    for (const [region, countryList] of Object.entries(regions)) {
      if (countryList.some(c => countryName.toLowerCase().includes(c.toLowerCase()))) {
        return region
      }
    }
    return 'Other'
  }

  const getMockCountries = (): Country[] => {
    return [
      // North Africa
      { id: 1, name: 'Egypt', isoCode: 'EG', region: 'North Africa', isiScore: 65.2 },
      { id: 2, name: 'Morocco', isoCode: 'MA', region: 'North Africa', isiScore: 58.1 },
      { id: 3, name: 'Tunisia', isoCode: 'TN', region: 'North Africa', isiScore: 62.4 },
      
      // West Africa
      { id: 4, name: 'Nigeria', isoCode: 'NG', region: 'West Africa', isiScore: 61.9 },
      { id: 5, name: 'Ghana', isoCode: 'GH', region: 'West Africa', isiScore: 68.2 },
      
      // East Africa
      { id: 6, name: 'Kenya', isoCode: 'KE', region: 'East Africa', isiScore: 69.3 },
      { id: 7, name: 'Rwanda', isoCode: 'RW', region: 'East Africa', isiScore: 71.8 },
      
      // Southern Africa
      { id: 8, name: 'South Africa', isoCode: 'ZA', region: 'Southern Africa', isiScore: 45.5 },
      { id: 9, name: 'Botswana', isoCode: 'BW', region: 'Southern Africa', isiScore: 67.3 },
      { id: 10, name: 'Mauritius', isoCode: 'MU', region: 'Southern Africa', isiScore: 73.1 }
    ]
  }

  const handleCountryClick = (country: Country) => {
    console.log('Country clicked:', country)
    // TODO: Navigate to country detail page or show modal
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    // TODO: Apply filters to countries data
  }

  const getUsernameFromEmail = (email: string) => {
    if (!email || !email.includes('@')) return 'User'
    const [localPart] = email.split('@')
    return localPart
  }

  const getInitialsFromEmail = (email: string) => {
    if (!email || !email.includes('@')) return 'US'
    const [localPart] = email.split('@')
    return localPart.slice(0, 2).toUpperCase()
  }

  const getFormattedName = () => {
    // Use first name + first letter of last name if available
    if (userFirstName && userLastName) {
      return `${userFirstName} ${userLastName.charAt(0)}.`
    }
    // Fallback to email-based username
    if (userFirstName) {
      return userFirstName
    }
    const username = getUsernameFromEmail(userEmail)
    return username.length > 5 ? username.slice(0, 5) + '...' : username
  }

  const getUserInitials = () => {
    // Use initials from first and last name if available
    if (userFirstName && userLastName) {
      return `${userFirstName.charAt(0)}${userLastName.charAt(0)}`.toUpperCase()
    }
    // Fallback to email-based initials
    return getInitialsFromEmail(userEmail)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header - Fixed */}
        <DashboardHeader
          userName={getUsernameFromEmail(userEmail)}
          userInitials={getUserInitials()}
          truncatedName={getFormattedName()}
        />
        
        {/* Content Area - Scrollable */}
        <div className="flex-1 flex min-h-0">
          {/* Filters Sidebar - Fixed */}
          <DashboardFilters
            onFiltersChange={handleFiltersChange}
            isCollapsed={filtersCollapsed}
            onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
          />

          {/* Main Map/Treemap Area - Scrollable */}
          {error ? (
            <div className="flex-1 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="text-red-600 mb-2">{error}</div>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <CountryTreemap
              countries={countries}
              onCountryClick={handleCountryClick}
              onToggleFilters={() => setFiltersCollapsed(!filtersCollapsed)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardFilters from '@/components/dashboard/DashboardFilters'
import CountryTreemap from '@/components/dashboard/CountryTreemap'
import { countriesApi, isiApi, metiApi, sentimentApi, marketsApi } from '@/lib/api'

interface Country {
  id: number
  name: string
  isoCode: string
  region?: string
  isiScore?: number
  metiScore?: number
  sentimentPulse?: string
  debtToGDP?: number
}

interface SectorData {
  sector_name: string
  value: number
  change_percent: number
}

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [originalCountries, setOriginalCountries] = useState<Country[]>([])
  const [newsData, setNewsData] = useState<Record<number, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<any>({})
  const [userEmail, setUserEmail] = useState<string>('')
  const [userFirstName, setUserFirstName] = useState<string>('')
  const [userLastName, setUserLastName] = useState<string>('')
  const [userProfilePicture, setUserProfilePicture] = useState<string>('')
  const [userPlan, setUserPlan] = useState<string>('free')
  const [sectorData, setSectorData] = useState<SectorData[]>([])

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    loadDashboardData()
    loadUserData()
    loadSectorData()
  }, [])

  // Watch for sector filter changes and recalculate rankings
  useEffect(() => {
    if (!filters.sectors || originalCountries.length === 0) return

    const selectedSectors = Object.entries(filters.sectors)
      .filter(([_, isSelected]) => isSelected)
      .map(([sector, _]) => sector)

    console.log('🔄 Sector filter changed:', filters.sectors)
    console.log('🔄 Selected sectors:', selectedSectors)
    console.log('🔄 News data available for countries:', Object.keys(newsData))

    if (selectedSectors.length === 0) {
      // No sectors selected, show original rankings
      setCountries(originalCountries)
      return
    }

    // Calculate sector-weighted scores using NEWS data
    const countriesWithSectorScores = originalCountries.map(country => {
      const countryNews = newsData[country.id] || []
      const originalISI = country.isiScore || 50

      if (countryNews.length === 0) {
        return { ...country, isiScore: originalISI }
      }

      // Debug: Log actual sectors in news data for first country
      if (country.id === 1) {
        const uniqueSectors = [...new Set(countryNews.map((n: any) => n.primary_sector || n.sector).filter(Boolean))]
        console.log(`📋 Available sectors in ${country.name} news:`, uniqueSectors)
      }

      // Map filter sectors to news topics
      const sectorMapping: Record<string, string[]> = {
        energy: ['Energy', 'Oil & Gas', 'Renewable Energy', 'Power'],
        technology: ['Technology', 'Fintech', 'Digital Economy', 'Telecom', 'ICT', 'Innovation'],
        infrastructure: ['Infrastructure', 'Real Estate', 'Construction', 'Transport', 'Transportation'],
        agriculture: ['Agriculture', 'Agribusiness', 'Food Security', 'Farming'],
        manufacturing: ['Manufacturing', 'Industrial', 'Production', 'Industry'],
        tourism: ['Tourism', 'Hospitality', 'Travel', 'Culture'],
        financial: ['Finance', 'Banking', 'Investment', 'Capital Markets', 'Economics', 'Economy'],
        healthcare: ['Healthcare', 'Health', 'Pharmaceutical', 'Medical']
      }

      // Calculate sector score based on news volume and sentiment
      let totalSectorScore = 0
      let sectorCount = 0

      selectedSectors.forEach(sector => {
        const sectorValues = sectorMapping[sector] || []

        // Filter news for this sector using topics array
        const sectorNews = countryNews.filter((news: any) => {
          const topics = news.topics || []
          return sectorValues.some(val =>
            topics.some((topic: string) =>
              topic.toLowerCase().includes(val.toLowerCase()) ||
              val.toLowerCase().includes(topic.toLowerCase())
            )
          )
        })

        // Debug: Log first 3 countries' sector matching
        if (country.id <= 3) {
          console.log(`🔍 ${country.name} - ${sector}: Found ${sectorNews.length}/${countryNews.length} articles`)
          if (sectorNews.length > 0) {
            console.log(`   Sample topics in news:`, sectorNews.slice(0, 3).map((n: any) => n.topics))
          }
        }

        if (sectorNews.length > 0) {
          // Calculate score: 50% news volume + 50% sentiment
          const volumeScore = Math.min(sectorNews.length * 10, 100) // 10 points per article, max 100

          const sentimentScores = sectorNews
            .map((news: any) => news.sentiment_score || 50)
            .filter((score: number) => score > 0)

          const avgSentiment = sentimentScores.length > 0
            ? sentimentScores.reduce((sum: number, s: number) => sum + s, 0) / sentimentScores.length
            : 50

          const sectorScore = (volumeScore * 0.5) + (avgSentiment * 0.5)
          totalSectorScore += sectorScore
          sectorCount++

          if (country.id <= 3) {
            console.log(`📰 ${country.name} - ${sector}: ${sectorNews.length} articles, sentiment ${avgSentiment.toFixed(1)} → score ${sectorScore.toFixed(1)}`)
          }
        }
      })

      if (sectorCount === 0) {
        return { ...country, isiScore: originalISI }
      }

      const avgSectorScore = totalSectorScore / sectorCount
      // Weight: 50% original ISI + 50% sector news score
      const weightedScore = (originalISI * 0.5) + (avgSectorScore * 0.5)

      return {
        ...country,
        isiScore: Math.round(weightedScore * 10) / 10
      }
    })

    // Sort by new weighted score
    const sortedCountries = [...countriesWithSectorScores].sort((a, b) =>
      (b.isiScore || 0) - (a.isiScore || 0)
    )

    console.log('🎯 Countries re-ranked by sectors:', sortedCountries)
    setCountries(sortedCountries)
  }, [filters.sectors, originalCountries, newsData])

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
          setUserProfilePicture(userData.profile_picture || '')
          setUserPlan(userData.subscription_plan || 'free')
          console.log('User name loaded:', userData.first_name, userData.last_name)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }
  }

  const loadSectorData = async () => {
    try {
      const response = await marketsApi.getLatestSectors()
      if (response.data.success && response.data.data) {
        // Transform the data to match SectorData interface
        const transformedData: SectorData[] = response.data.data.map((sector: any) => {
          // Extract numeric value from strings like "$114.9B", "5.1%", etc.
          let numericValue = parseFloat(sector.value.replace(/[^0-9.-]/g, ''))

          // Handle billions (B suffix)
          if (sector.value.includes('B')) {
            numericValue = numericValue * 1000000000
          }
          // Handle millions (M suffix)
          else if (sector.value.includes('M')) {
            numericValue = numericValue * 1000000
          }
          // Handle thousands (K suffix)
          else if (sector.value.includes('K')) {
            numericValue = numericValue * 1000
          }

          return {
            sector_name: sector.name,
            value: numericValue,
            change_percent: parseFloat(sector.change.replace(/[^0-9.-]/g, ''))
          }
        })
        setSectorData(transformedData)
      }
    } catch (error) {
      console.error('Error loading sector data:', error)
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

        // Fetch debt to GDP data for all countries (using 2021 - most recent year with complete data)
        console.log('📊 Fetching debt to GDP data...')
        const debtPromises = countriesData.map(country =>
          marketsApi.getMacroeconomic(country.id, 2021).catch(err => {
            console.log(`⚠️ Debt to GDP fetch failed for ${country.name}:`, err)
            return null
          })
        )
        const debtResponses = await Promise.all(debtPromises)

        // Combine countries with their ISI scores, METI scores, sentiment, and debt to GDP
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

          // Debt to GDP Ratio
          let debtToGDP = undefined
          const debtResponse = debtResponses[index]
          if (debtResponse && debtResponse.data?.success && debtResponse.data?.data) {
            const macroData = Array.isArray(debtResponse.data.data) ? debtResponse.data.data : [debtResponse.data.data]
            const debtKPI = macroData.find((kpi: any) => kpi.code === 'DEBT_TO_GDP')
            if (debtKPI) {
              debtToGDP = debtKPI.value
            }
          }

          console.log(`🔗 Mapping ${country.name} (ID: ${country.id}): ISI=${isiScore?.score || 'N/A'}, METI=${metiScore || 'N/A'}, Sentiment=${sentimentPulse}, Debt/GDP=${debtToGDP || 'N/A'}`)

          return {
            ...country,
            isoCode: country.isoCode || country.name.substring(0, 3).toUpperCase(),
            isiScore: isiScore ? isiScore.score : undefined,
            metiScore,
            sentimentPulse,
            debtToGDP,
            region: getRegionFromCountry(country.name)
          }
        })

        console.log('🎯 Final countries with scores:', countriesWithScores)
        setCountries(countriesWithScores)
        setOriginalCountries(countriesWithScores)

        // Store news data by country for sector filtering
        const newsMap: Record<number, any[]> = {}
        console.log('🔍 Processing sentiment responses...', sentimentResponses.length)
        sentimentResponses.forEach((response, index) => {
          console.log(`🔍 Response ${index}:`, response?.data?.success, 'articles:', Array.isArray(response?.data?.data) ? response.data.data.length : 0)
          if (response && response.data?.success && response.data?.data) {
            const countryId = countriesData[index].id
            newsMap[countryId] = Array.isArray(response.data.data) ? response.data.data : []

            // Debug: Log first article structure for ANY country with data
            if (newsMap[countryId].length > 0 && !Object.keys(newsMap).some(k => newsMap[Number(k)].length > 0 && Number(k) < countryId)) {
              console.log('📰 Sample news article structure:', newsMap[countryId][0])
              console.log('📰 All fields in first article:', Object.keys(newsMap[countryId][0]))
            }
          }
        })
        console.log('✅ News data loaded for sector filtering:', Object.keys(newsMap).length, 'countries')
        console.log('📊 Total articles across all countries:', Object.values(newsMap).reduce((sum: number, arr: any[]) => sum + arr.length, 0))
        setNewsData(newsMap)
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
          profilePicture={userProfilePicture}
          userPlan={userPlan}
        />
        
        {/* Content Area - Scrollable */}
        <div className="flex-1 flex min-h-0">
          {/* Filters Sidebar - Fixed */}
          <DashboardFilters
            onFiltersChange={handleFiltersChange}
            isCollapsed={filtersCollapsed}
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
              filtersCollapsed={filtersCollapsed}
              selectedSectors={filters.sectors || {}}
              displayMetric={filters.displayMetric || 'isi'}
              sectorData={sectorData}
            />
          )}
        </div>
      </div>
    </div>
  )
}
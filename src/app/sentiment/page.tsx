'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import SentimentFilters from '@/components/sentiment/SentimentFilters'
import { loadUserData, getFormattedName, getUserInitials, getUsernameFromEmail, type UserData } from '@/lib/userUtils'


import { sentimentApi, countriesApi } from '@/lib/api'
import { getCountryPreference } from '@/lib/countryPreference'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import Image from 'next/image'

interface Country {
  id: number
  name: string
  isoCode: string
}

interface NewsArticle {
  id: number
  title: string
  source: string
  published_at: string
  sentiment_label: string
  topics: string[]
  url: string
}

export default function SentimentPulsePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const [filtersCollapsed, setFiltersCollapsed] = useState(false)
  const [filters, setFilters] = useState<any>({})
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [filteredNewsArticles, setFilteredNewsArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData>({ email: '', firstName: '', lastName: '' })
  const [userDataLoading, setUserDataLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6 M')
  const [sentimentTimelineData, setSentimentTimelineData] = useState<any[]>([])
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewingMonth, setViewingMonth] = useState(new Date())

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    loadInitialData()
    const fetchUserData = async () => {
      const data = await loadUserData()
      setUserData(data)
      setUserDataLoading(false)
    }
    fetchUserData()
  }, [])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showCalendar && !target.closest('.relative')) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCalendar])

  // Sync viewing month with selected date when calendar opens
  useEffect(() => {
    if (showCalendar) {
      setViewingMonth(selectedDate)
    }
  }, [showCalendar])

  // Reload data when date or period changes
  useEffect(() => {
    if (selectedCountry) {
      loadSentimentData()
      loadTrendsData(getPeriodDays(selectedPeriod))
    }
  }, [selectedDate, selectedPeriod])

  useEffect(() => {
    if (selectedCountry) {
      loadSentimentData()
      loadTrendsData(getPeriodDays(selectedPeriod))
    }
  }, [selectedCountry])

  // Apply filters to news articles
  useEffect(() => {
    if (!newsArticles || newsArticles.length === 0) {
      setFilteredNewsArticles([])
      return
    }

    let filtered = [...newsArticles]

    // Filter by sectors
    if (filters.sectors) {
      const selectedSectors = Object.entries(filters.sectors)
        .filter(([_, isSelected]) => isSelected)
        .map(([sector, _]) => sector)

      if (selectedSectors.length > 0) {
        // Map filter sectors to topic keywords
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

        filtered = filtered.filter(article => {
          const topics = article.topics || []
          return selectedSectors.some(sector => {
            const sectorValues = sectorMapping[sector] || []
            return sectorValues.some(val =>
              topics.some((topic: string) =>
                topic.toLowerCase().includes(val.toLowerCase()) ||
                val.toLowerCase().includes(topic.toLowerCase())
              )
            )
          })
        })
      }
    }

    setFilteredNewsArticles(filtered)
  }, [newsArticles, filters])

  const getPeriodDays = (period: string) => {
    const daysMap: { [key: string]: number } = {
      '1 D': 1, '5 D': 5, '1 M': 30, '3 M': 90,
      '6 M': 180, 'YTD': getDaysFromYearStart(), '1 Y': 365,
      '5 Y': 1825, '10 Y': 3650
    }
    return daysMap[period] || 180
  }

  const getDaysFromYearStart = () => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - startOfYear.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const loadTrendsData = async (daysBack: number = 180) => {
    if (!selectedCountry) return

    try {
      setTrendsLoading(true)
      const response = await sentimentApi.getTrends(selectedCountry.id, daysBack)

      if (response.data.success && response.data.data?.trend_data) {
        // Generate correct dates based on selected period
        const generatedData = generateDateBasedData(response.data.data.trend_data)
        setSentimentTimelineData(generatedData)
      }
    } catch (error) {
      console.error('Error loading trend data:', error)
      // Generate fallback data with correct dates
      setSentimentTimelineData(generateFallbackData())
    } finally {
      setTrendsLoading(false)
    }
  }

  const generateDateBasedData = (backendData: any[]) => {
    const today = new Date(selectedDate)
    const dataPoints: any[] = []

    // Determine number of points and interval based on period
    let numPoints = 5
    let interval = 1 // days

    switch (selectedPeriod) {
      case '1 D':
        // Show 5 points for the same day (every few hours)
        numPoints = 5
        const oneDayFallback = [
          { positive: 55, neutral: 60, negative: 25 },
          { positive: 48, neutral: 58, negative: 32 },
          { positive: 52, neutral: 55, negative: 28 },
          { positive: 60, neutral: 52, negative: 22 },
          { positive: 58, neutral: 54, negative: 24 }
        ]
        for (let i = 0; i < numPoints; i++) {
          const date = new Date(today)
          date.setHours(8 + i * 3) // 8am, 11am, 2pm, 5pm, 8pm

          const backendPoint = backendData[Math.min(i, backendData.length - 1)]
          dataPoints.push({
            date: formatDate(date.toISOString(), '1 D'),
            positive: backendPoint?.positive !== undefined ? Math.round(backendPoint.positive) : oneDayFallback[i].positive,
            negative: backendPoint?.negative !== undefined ? Math.round(backendPoint.negative) : oneDayFallback[i].negative,
            neutral: backendPoint?.neutral !== undefined ? Math.round(backendPoint.neutral) : oneDayFallback[i].neutral
          })
        }
        break

      case '5 D':
        // Show last 5 days
        numPoints = 5
        const fallbackValues5D = [
          { positive: 58, neutral: 52, negative: 42 },
          { positive: 62, neutral: 48, negative: 38 },
          { positive: 55, neutral: 50, negative: 45 },
          { positive: 60, neutral: 55, negative: 40 },
          { positive: 65, neutral: 52, negative: 35 }
        ]
        for (let i = 4; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)

          const backendPoint = backendData[Math.min(4 - i, backendData.length - 1)]
          dataPoints.push({
            date: formatDate(date.toISOString(), '5 D'),
            positive: backendPoint?.positive !== undefined ? Math.round(backendPoint.positive) : fallbackValues5D[4 - i].positive,
            negative: backendPoint?.negative !== undefined ? Math.round(backendPoint.negative) : fallbackValues5D[4 - i].negative,
            neutral: backendPoint?.neutral !== undefined ? Math.round(backendPoint.neutral) : fallbackValues5D[4 - i].neutral
          })
        }
        break

      case '1 M':
        // Show 5 equally distributed points over 1 month
        numPoints = 5
        interval = 30 / (numPoints - 1) // ~7.5 days between points
        const fallbackValues1M = [
          { positive: 48, neutral: 58, negative: 52 },
          { positive: 55, neutral: 52, negative: 45 },
          { positive: 62, neutral: 48, negative: 38 },
          { positive: 58, neutral: 50, negative: 42 },
          { positive: 65, neutral: 52, negative: 35 }
        ]
        for (let i = 0; i < numPoints; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - Math.round(30 - i * interval))

          const backendPoint = backendData[Math.min(i, backendData.length - 1)]
          dataPoints.push({
            date: formatDate(date.toISOString(), '1 M'),
            positive: backendPoint?.positive !== undefined ? Math.round(backendPoint.positive) : fallbackValues1M[i].positive,
            negative: backendPoint?.negative !== undefined ? Math.round(backendPoint.negative) : fallbackValues1M[i].negative,
            neutral: backendPoint?.neutral !== undefined ? Math.round(backendPoint.neutral) : fallbackValues1M[i].neutral
          })
        }
        break

      case '3 M':
        // Show 5 equally distributed points over 3 months
        numPoints = 5
        interval = 90 / (numPoints - 1) // ~22.5 days between points
        const fallbackValues3M = [
          { positive: 42, neutral: 62, negative: 58 },
          { positive: 50, neutral: 55, negative: 50 },
          { positive: 58, neutral: 50, negative: 42 },
          { positive: 62, neutral: 48, negative: 38 },
          { positive: 65, neutral: 52, negative: 35 }
        ]
        for (let i = 0; i < numPoints; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - Math.round(90 - i * interval))

          const backendPoint = backendData[Math.min(i, backendData.length - 1)]
          dataPoints.push({
            date: formatDate(date.toISOString(), '3 M'),
            positive: backendPoint?.positive !== undefined ? Math.round(backendPoint.positive) : fallbackValues3M[i].positive,
            negative: backendPoint?.negative !== undefined ? Math.round(backendPoint.negative) : fallbackValues3M[i].negative,
            neutral: backendPoint?.neutral !== undefined ? Math.round(backendPoint.neutral) : fallbackValues3M[i].neutral
          })
        }
        break

      case '6 M':
      default:
        // Show 5 equally distributed points over 6 months (180 days)
        // Days back: 180, 135, 90, 45, 0
        const sixMonthDaysBack = [180, 135, 90, 45, 0]
        // Consistent fallback values (not random)
        const fallbackValues = [
          { positive: 65, neutral: 55, negative: 28 },
          { positive: 52, neutral: 60, negative: 48 },
          { positive: 25, neutral: 50, negative: 65 },
          { positive: 24, neutral: 40, negative: 58 },
          { positive: 28, neutral: 60, negative: 48 }
        ]
        for (let i = 0; i < 5; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - sixMonthDaysBack[i])
          date.setHours(12, 0, 0, 0) // Set to noon to avoid timezone issues

          const backendPoint = backendData[Math.min(i, backendData.length - 1)]
          const point = {
            date: formatDate(date.toISOString(), '6 M'),
            positive: backendPoint?.positive !== undefined ? Math.round(backendPoint.positive) : fallbackValues[i].positive,
            negative: backendPoint?.negative !== undefined ? Math.round(backendPoint.negative) : fallbackValues[i].negative,
            neutral: backendPoint?.neutral !== undefined ? Math.round(backendPoint.neutral) : fallbackValues[i].neutral
          }
          dataPoints.push(point)
          console.log('6M Point', i, 'Days back:', sixMonthDaysBack[i], 'Date:', point.date, 'Full date:', date.toISOString())
        }
        break
    }

    console.log('Generated data points:', dataPoints.length, dataPoints)
    return dataPoints
  }

  const generateFallbackData = () => {
    return generateDateBasedData([])
  }

  const formatDate = (dateString: string, period?: string) => {
    const date = new Date(dateString)
    const currentPeriod = period || selectedPeriod

    // For 1 day, show time (e.g., "10:00 AM")
    if (currentPeriod === '1 D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    // For 5 days and 1 month, show MM/DD
    if (currentPeriod === '5 D' || currentPeriod === '1 M') {
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}/${day}`
    }

    // For 3 months and 6 months, show MM/DD/YY
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}/${day}/${year}`
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    loadTrendsData(getPeriodDays(period))
  }

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const response = await countriesApi.getAfricanCountries()
      if (response.data.success && response.data.data) {
        setCountries(response.data.data)

        // Check for preferred country from settings
        const preferredCountry = getCountryPreference()
        let countryToSelect = null

        if (preferredCountry) {
          // Find the preferred country in the list
          countryToSelect = response.data.data.find(
            (c: Country) => c.id === preferredCountry.id || c.name === preferredCountry.name
          )
          console.log('Preferred country found:', countryToSelect?.name || 'None')
        }

        // Fall back to Kenya or first country if no preference or preference not found
        if (!countryToSelect) {
          const kenya = response.data.data.find((c: Country) => c.name === 'Kenya')
          countryToSelect = kenya || response.data.data[0]
        }

        if (countryToSelect) {
          setSelectedCountry(countryToSelect)
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error)
      // Fallback to mock data
      const mockCountries = [
        { id: 2, name: 'Kenya', isoCode: 'KE' },
        { id: 1, name: 'Nigeria', isoCode: 'NG' },
        { id: 4, name: 'Ghana', isoCode: 'GH' },
        { id: 3, name: 'South Africa', isoCode: 'ZA' },
      ]
      setCountries(mockCountries)
      setSelectedCountry(mockCountries[0])
    } finally {
      setLoading(false)
    }
  }

  const loadSentimentData = async () => {
    if (!selectedCountry) return

    try {
      const response = await sentimentApi.getNews(selectedCountry.id, 7, 50)
      if (response.data.success && response.data.data) {
        setNewsArticles(response.data.data)
      }
    } catch (error) {
      console.error('Error loading sentiment data:', error)
    }
  }

  const getCountryFlag = (countryName: string) => {
    const flagMap: { [key: string]: string } = {
      'Nigeria': '/assets/nigeria.svg',
      'Ghana': '/assets/ghana.svg',
      'South Africa': '/assets/south-africa.svg',
      'Egypt': '/assets/egypt.svg',
      'Rwanda': '/assets/rwanda.svg',
      'Botswana': '/assets/botswana.svg',
      'Tunisia': '/assets/tunisia.svg',
      'Mauritius': '/assets/mauritius.svg',
      'Kenya': '/assets/kenya.svg', // Will use emoji fallback if not exists
      'Morocco': '/assets/morocco.svg', // Will use emoji fallback if not exists
    }
    return flagMap[countryName] || null
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return 'Today · <1h ago'
    if (diffHours < 24) return `Today · ${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Economics': 'bg-blue-50 text-blue-700 border border-blue-200',
      'Policy': 'bg-green-50 text-green-700 border border-green-200',
      'Regulation': 'bg-orange-50 text-orange-700 border border-orange-200',
      'Technology': 'bg-purple-50 text-purple-700 border border-purple-200',
      'Business': 'bg-pink-50 text-pink-700 border border-pink-200',
    }
    return colors[category] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const getSentimentBadgeColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'bg-green-50 text-green-700 border border-green-200'
    if (sentiment === 'negative') return 'bg-red-50 text-red-700 border border-red-200'
    return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  }

  // Calculate sentiment distribution from real news articles
  const calculateSentimentMix = () => {
    if (newsArticles.length === 0) {
      // Fallback to hardcoded data
      return [
        { name: 'Positive', value: 40, color: '#8FE36C' },
        { name: 'Neutral', value: 25, color: '#FFE054' },
        { name: 'Negative', value: 35, color: '#FF8F85' },
      ]
    }

    const positive = newsArticles.filter(a => a.sentiment_label === 'positive').length
    const negative = newsArticles.filter(a => a.sentiment_label === 'negative').length
    const neutral = newsArticles.filter(a => a.sentiment_label === 'neutral').length
    const total = newsArticles.length

    return [
      { name: 'Positive', value: Math.round((positive / total) * 100), color: '#8FE36C' },
      { name: 'Neutral', value: Math.round((neutral / total) * 100), color: '#FFE054' },
      { name: 'Negative', value: Math.round((negative / total) * 100), color: '#FF8F85' },
    ]
  }

  // Calculate sector sentiment from news articles by topic
  const getSectorsData = () => {
    // Fallback hardcoded data
    const fallbackData = [
      { name: 'Agriculture', positive: 90, neutral: 10, negative: 0 },
      { name: 'Energy', positive: 56, neutral: 0, negative: 44 },
      { name: 'Healthcare', positive: 45, neutral: 30, negative: 25 },
      { name: 'Mining', positive: 20, neutral: 30, negative: 50 },
      { name: 'Fintech', positive: 20, neutral: 0, negative: 80 },
      { name: 'Infrastructure', positive: 10, neutral: 50, negative: 40 },
    ]

    // If no news articles, use fallback
    if (!newsArticles || newsArticles.length === 0) return fallbackData

    // Calculate sentiment for each topic from news articles
    const calculateTopicSentiment = (topicKeywords: string[]) => {
      const topicArticles = newsArticles.filter(article =>
        article.topics?.some(topic =>
          topicKeywords.some(keyword =>
            topic.toLowerCase().includes(keyword.toLowerCase())
          )
        )
      )

      if (topicArticles.length === 0) return null

      const positive = topicArticles.filter(a => a.sentiment_label === 'positive').length
      const negative = topicArticles.filter(a => a.sentiment_label === 'negative').length
      const neutral = topicArticles.filter(a => a.sentiment_label === 'neutral').length
      const total = topicArticles.length

      return {
        positive: Math.round((positive / total) * 100),
        negative: Math.round((negative / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        count: total
      }
    }

    // Define sectors with their topic keywords
    const sectorDefinitions = [
      { name: 'Economics', keywords: ['Economics', 'Economic'] },
      { name: 'Policy', keywords: ['Policy', 'Regulation'] },
      { name: 'Business', keywords: ['Business', 'Investment'] },
      { name: 'Technology', keywords: ['Technology', 'Tech'] },
      { name: 'Infrastructure', keywords: ['Infrastructure'] },
      { name: 'Banking', keywords: ['Banking', 'Finance', 'Financial'] },
    ]

    // Calculate sentiment for each sector
    const sectors = []
    for (const sector of sectorDefinitions) {
      const sentiment = calculateTopicSentiment(sector.keywords)
      if (sentiment && sentiment.count >= 1) { // Only include if at least 1 article (lowered from 2 for countries with limited news)
        sectors.push({
          name: sector.name,
          positive: sentiment.positive,
          negative: sentiment.negative,
          neutral: sentiment.neutral
        })
      }
    }

    // Sort by positive sentiment (descending)
    sectors.sort((a, b) => b.positive - a.positive)

    // If we have real data, use it; otherwise use fallback (lowered from 3 to 1 sector minimum)
    return sectors.length >= 1 ? sectors : fallbackData
  }

  const sectorsData = getSectorsData()

  const periods = ['1 D', '5 D', '1 M', '3 M', '6 M']

  // Calculate sentiment mix dynamically from news articles
  const sentimentMixData = calculateSentimentMix()

  if (loading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const displayArticles = filteredNewsArticles.length > 0 ? filteredNewsArticles : newsArticles

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <DashboardHeader
          userName={getUsernameFromEmail(userData.email)}
          userInitials={getUserInitials(userData)}
          truncatedName={getFormattedName(userData)}
          profilePicture={userData.profilePicture}
        />

        {/* Content Area with Filters */}
        <div className="flex-1 flex min-h-0">
          {/* Filters Sidebar - Only show when NOT collapsed */}
          {!filtersCollapsed && (
            <SentimentFilters
              onFiltersChange={setFilters}
              isCollapsed={filtersCollapsed}
              onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
            />
          )}

          {/* Main scrollable content */}
          <div className="flex-1 w-full overflow-y-auto p-8 bg-white">
          {/* Top Bar: Filters button (when collapsed) OR Country Selector (when open) + Date */}
          <div className="flex items-center justify-between mb-8">
            {/* Left side: Filters button when collapsed, Country selector when open */}
            <div className="flex items-center gap-3">
              {filtersCollapsed ? (
                <button
                  onClick={() => setFiltersCollapsed(false)}
                  className="bg-black rounded-md px-4 py-2 cursor-pointer flex items-center gap-2"
                  aria-label="Expand filters"
                >
                  <Image
                    src="/assets/flask.svg"
                    alt="Filter"
                    width={20}
                    height={20}
                    className="text-white"
                  />
                  <span className="text-white font-semibold text-sm mr-8">Filters</span>
                  <Image
                    src="/assets/filter.svg"
                    alt="Expand"
                    width={16}
                    height={16}
                    className="text-white"
                  />
                </button>
              ) : (
                /* Country Selector - shown on left when filters are open */
                selectedCountry && (
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 pointer-events-none z-10">
                      {getCountryFlag(selectedCountry.name) ? (
                        <Image
                          src={getCountryFlag(selectedCountry.name)!}
                          alt={selectedCountry.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-base">🌍</span>
                      )}
                    </div>
                    <select
                      value={selectedCountry.id}
                      onChange={(e) => {
                        const country = countries.find(c => c.id === parseInt(e.target.value))
                        setSelectedCountry(country || null)
                      }}
                      className="bg-white text-gray-900 pl-14 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-200 appearance-none cursor-pointer"
                    >
                      {countries.map(country => (
                        <option key={country.id} value={country.id}>{country.name}</option>
                      ))}
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                )
              )}
            </div>

            {/* Right side: Calendar (and Country selector if filters collapsed) */}
            <div className="flex items-center gap-3">
              {/* Country Selector - shown on right when filters are collapsed */}
              {filtersCollapsed && selectedCountry && (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 pointer-events-none z-10">
                    {getCountryFlag(selectedCountry.name) ? (
                      <Image
                        src={getCountryFlag(selectedCountry.name)!}
                        alt={selectedCountry.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base">🌍</span>
                    )}
                  </div>
                  <select
                    value={selectedCountry.id}
                    onChange={(e) => {
                      const country = countries.find(c => c.id === parseInt(e.target.value))
                      setSelectedCountry(country || null)
                    }}
                    className="bg-white text-gray-900 pl-14 pr-10 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-200 appearance-none cursor-pointer"
                  >
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>{country.name}</option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              )}
              {/* Calendar - always on the right */}
              <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </button>

              {/* Calendar Dropdown */}
              {showCalendar && (
                <div className="absolute right-0 mt- bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 w-80">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => {
                        const newDate = new Date(viewingMonth)
                        newDate.setMonth(newDate.getMonth() - 1)
                        setViewingMonth(newDate)
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-base font-semibold text-gray-900">
                      {viewingMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => {
                        const newDate = new Date(viewingMonth)
                        newDate.setMonth(newDate.getMonth() + 1)
                        setViewingMonth(newDate)
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-xs font-medium text-gray-500 p-2">{day}</div>
                    ))}
                    {(() => {
                      const year = viewingMonth.getFullYear()
                      const month = viewingMonth.getMonth()
                      const firstDay = new Date(year, month, 1).getDay()
                      const daysInMonth = new Date(year, month + 1, 0).getDate()
                      const days = []

                      // Empty cells for days before month starts
                      for (let i = 0; i < firstDay; i++) {
                        days.push(<div key={`empty-${i}`} className="p-2"></div>)
                      }

                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day)
                        const isSelected = date.toDateString() === selectedDate.toDateString()
                        const isToday = date.toDateString() === new Date().toDateString()

                        days.push(
                          <button
                            key={day}
                            onClick={() => {
                              setSelectedDate(date)
                              setShowCalendar(false)
                            }}
                            className={`p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 text-white hover:bg-blue-600 font-semibold' :
                              isToday ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      }

                      return days
                    })()}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                    <button
                      onClick={() => {
                        const today = new Date()
                        setSelectedDate(today)
                        setViewingMonth(today)
                        setShowCalendar(false)
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div> {/* End Calendar relative */}
            </div> {/* End Country Selector and Date */}
          </div> {/* End Top Bar */}

          {/* Main Grid */}
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
            {/* Sentiment Over Time */}
            <div>
              <div className="mb-4">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Sentiment Over Time</h2>
                <p className="text-gray-500 text-sm">Confidence-based outlook for market entry over the next 6 months.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Period Selector */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="inline-flex gap-2">
                    {periods.map(period => (
                      <button
                        key={period}
                        onClick={() => handlePeriodChange(period)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          selectedPeriod === period
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
              {/* Legend */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8FE36C' }}></div>
                  <span className="text-sm text-gray-600">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFE054' }}></div>
                  <span className="text-sm text-gray-600">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF8F85' }}></div>
                  <span className="text-sm text-gray-600">Negative</span>
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />

                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#111827', fontWeight: 600 }}

                    itemStyle={{ color: '#6b7280' }}
                  />
                  <Line type="monotone" dataKey="positive" stroke="#8FE36C" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="neutral" stroke="#FFE054" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="negative" stroke="#FF8F85" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>

              {/* Tooltip Info */}
              {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-900 font-medium">Technology & Fintech</span>
                  </div>
                  <span className="text-xs text-gray-500">03/05/25</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500">Sentiment</span>
                    <div className="text-sm text-green-600 font-semibold">Positive</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Mentions</span>
                    <div className="text-sm text-gray-900 font-semibold">73</div>
                  </div>
                </div>
              </div> */}
                </div>
              </div>
            </div>

            {/* Top Positive Sectors */}
            <div>
              <div className="mb-4">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Top Positive Sectors by Sentiment</h2>
                <p className="text-gray-500 text-sm">Highlights where investor confidence is rising or falling.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 h-[428px] flex flex-col">

              {/* Legend */}
              <div className="flex gap-6 mb-6 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8FE36C' }}></div>
                  <span className="text-sm text-gray-600">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFE054' }}></div>
                  <span className="text-sm text-gray-600">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF8F85' }}></div>
                  <span className="text-sm text-gray-600">Negative</span>
                </div>
              </div>

              {/* Stacked Bars - Scrollable */}
              <div className="space-y-5 overflow-y-auto flex-1 pr-2">
                {sectorsData.map((sector) => (
                  <div key={sector.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-medium">{sector.name}</span>
                      <span className="text-sm text-gray-900 font-semibold">{sector.positive}%</span>
                    </div>
                    <div className="flex h-8 rounded-full overflow-hidden bg-gray-100">
                      {sector.positive > 0 && (
                        <div
                          style={{ width: `${sector.positive}%`, backgroundColor: '#8FE36C' }}
                          className="flex items-center justify-center relative group cursor-pointer"
                        >
                          <span className="text-xs text-white font-semibold px-3 py-1 bg-gray-900 rounded-full absolute opacity-0 group-hover:opacity-100 transition-opacity">{sector.positive}%</span>
                        </div>
                      )}
                      {sector.neutral > 0 && (
                        <div
                          style={{ width: `${sector.neutral}%`, backgroundColor: '#FFE054' }}
                          className="flex items-center justify-center relative group cursor-pointer"
                        >
                          <span className="text-xs text-white font-semibold px-3 py-1 bg-gray-900 rounded-full absolute opacity-0 group-hover:opacity-100 transition-opacity">{sector.neutral}%</span>
                        </div>
                      )}
                      {sector.negative > 0 && (
                        <div
                          style={{ width: `${sector.negative}%`, backgroundColor: '#FF8F85' }}
                          className="flex items-center justify-center relative group cursor-pointer"
                        >
                          <span className="text-xs text-white font-semibold px-3 py-1 bg-gray-900 rounded-full absolute opacity-0 group-hover:opacity-100 transition-opacity">{sector.negative}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </div>
 </div>
          {/* Bottom Grid - Signal Cards & Sentiment Mix */}
          <div className="grid grid-cols-2 gap-6 items-stretch mb-6">
            {/* Signal Cards */}
            <div className="flex flex-col">
              <div className="mb-4">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Signal Cards</h2>
                <p className="text-gray-500 text-sm">
                  Highlights why investor confidence is declining across sectors.
                </p>
              </div>

              {/* Make this div stretch to full height */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex-1 flex flex-col">
                <div className="divide-y divide-gray-200 flex-1 overflow-y-auto">
                  {displayArticles.slice(0, 4).map((article, index) => (
                    <div
                      key={article.id}
                      className={`py-4 transition-all cursor-pointer ${
                        index === 0 ? 'pt-0' : ''
                      }`}
                    >
                      <h3 className="text-gray-900 text-sm font-medium mb-3 leading-snug">
                        {article.title}
                      </h3>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                              article.topics?.[0] || 'Economics'
                            )}`}
                          >
                            {article.topics?.[0] || 'Economics'}
                          </span>
                          {article.sentiment_label && (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getSentimentBadgeColor(
                                article.sentiment_label
                              )}`}
                            >
                              {article.sentiment_label}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {getRelativeTime(article.published_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sentiment Mix */}
            <div className="flex flex-col">
              <div className="mb-4">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Sentiment Mix</h2>
                <p className="text-gray-500 text-sm">
                  Confidence-based outlook for market entry over the next 6 months.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-6 flex flex-col flex-1">
                  {/* Legend */}
                  <div className="flex gap-6 mb-6 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8FE36C' }}></div>
                      <span className="text-sm text-gray-600">Positive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFE054' }}></div>
                      <span className="text-sm text-gray-600">Neutral</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF8F85' }}></div>
                      <span className="text-sm text-gray-600">Negative</span>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="flex items-center justify-center flex-1">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={sentimentMixData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={130}
                          paddingAngle={0}
                          dataKey="value"
                          label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                        const RADIAN = Math.PI / 180
                        // Ensure cx, cy, midAngle, innerRadius, outerRadius are numbers and not undefined
                        const cxNum = typeof cx === 'number' ? cx : 0
                        const cyNum = typeof cy === 'number' ? cy : 0
                        const midAngleNum = typeof midAngle === 'number' ? midAngle : 0
                        const innerRadiusNum = typeof innerRadius === 'number' ? innerRadius : 0
                        const outerRadiusNum = typeof outerRadius === 'number' ? outerRadius : 0
                        const radius = innerRadiusNum + (outerRadiusNum - innerRadiusNum) * 0.5
                        const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN)
                        const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN)
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="black"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="16"
                            fontWeight="400"
                          >
                            {`${value}%`}
                          </text>
                        )
                      }}
                      labelLine={false}
                    >
                      {sentimentMixData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#111827', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                  </div> {/* End chart wrapper */}
                </div> {/* End p-6 padding */}
              </div> {/* End card */}
            </div> {/* End Sentiment Mix flex-col */}
          </div> {/* End Bottom grid */}

          {/* End Main scrollable content */}
        </div> {/* End Content Area with Filters */}
      </div> {/* End Main Content */}
    </div> {/* End Main container */}
    </div>
  )
}

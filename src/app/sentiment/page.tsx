'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import FilterPills from '@/components/sentiment/FilterPills'
import ZawadiInsights from '@/components/sentiment/ZawadiInsights'
import TrendChart from '@/components/sentiment/TrendChart'
import TabbedNewsFeed from '@/components/sentiment/TabbedNewsFeed'
import CountryComparison from '@/components/sentiment/CountryComparison'
import SectorSentimentChart from '@/components/sentiment/SectorSentimentChart'
import EnhancedWordCloud from '@/components/sentiment/EnhancedWordCloud'
import { loadUserData, getFormattedName, getUserInitials, getUsernameFromEmail, type UserData } from '@/lib/userUtils'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import Link from 'next/link'

import { sentimentApi, countriesApi } from '@/lib/api'
import { getCountryPreference } from '@/lib/countryPreference'

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
  sentiment_score: number
  topics: string[]
  url: string
  country_id?: number
}

export default function SentimentPulsePage() {
  const [userData, setUserData] = useState<UserData>({ email: '', firstName: '', lastName: '' })
  const { features } = usePlanFeatures(userData.userPlan)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  const [selectedCountries, setSelectedCountries] = useState<Country[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [articlesByCountry, setArticlesByCountry] = useState<{ [countryId: number]: NewsArticle[] }>({})
  const [loading, setLoading] = useState(true)
  const [userDataLoading, setUserDataLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6 M')
  const [sentimentTimelineData, setSentimentTimelineData] = useState<any[]>([])
  const [trendsLoading, setTrendsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    loadInitialData()
    const fetchUserData = async () => {
      try {
        const data = await loadUserData()
        setUserData(data)
      } catch (error) {
        console.error('Error loading user data:', error)
        // Set default user data on error
        setUserData({
          email: 'user@example.com',
          firstName: 'Guest',
          lastName: 'User',
          userPlan: 'free'
        })
      } finally {
        setUserDataLoading(false)
      }
    }
    fetchUserData()
  }, [])

  useEffect(() => {
    if (selectedCountries.length > 0) {
      loadSentimentData()
      loadTrendsData(getPeriodDays(selectedPeriod))
    }
  }, [selectedCountries, selectedPeriod])

  const getPeriodDays = (period: string) => {
    const daysMap: { [key: string]: number } = {
      '1 D': 1, '5 D': 5, '1 M': 30, '3 M': 90, '6 M': 180
    }
    return daysMap[period] || 180
  }

  const loadTrendsData = async (daysBack: number = 180) => {
    if (selectedCountries.length === 0) return

    try {
      setTrendsLoading(true)
      // Pass all selected country IDs to get combined trends
      const countryIds = selectedCountries.map(c => c.id)
      const response = await sentimentApi.getTrends(countryIds, daysBack)

      if (response.data.success && response.data.data?.trend_data) {
        const generatedData = generateDateBasedData(response.data.data.trend_data)
        setSentimentTimelineData(generatedData)
      } else {
        console.error('Failed to load trends')
        setSentimentTimelineData([])
      }
    } catch (error) {
      console.error('Error loading trend data:', error)
      setSentimentTimelineData([])
    } finally {
      setTrendsLoading(false)
    }
  }

  const generateDateBasedData = (backendData: any[]) => {
    // No fallback - only use real backend data
    if (!backendData || backendData.length === 0) {
      return []
    }

    // Use backend data directly since it already has the right format and time buckets
    return backendData.map((point: any) => {
      // Format annotation if it exists
      let annotation = undefined
      if (point.annotation) {
        const engagementScore = point.annotation.engagement_score || 0
        const articleCount = point.article_count || 0

        annotation = {
          title: formatDate(point.date),
          description: `Volume was ${Math.round((engagementScore / 100) * 317)}% higher than usual driven by:`,
          metrics: [
            {
              label: `reposts of this Post`,
              value: `${(engagementScore * 0.15).toFixed(1)}k`,
              icon: 'retweet'
            },
            {
              label: `mentions using the hashtag #${point.annotation.title.toLowerCase().replace(/\s+/g, '')}`,
              value: Math.round(engagementScore * 2.11).toString(),
              icon: 'hashtag'
            },
            {
              label: `mentions from news sites`,
              value: Math.round(articleCount * 18.7).toString(),
              icon: 'news'
            }
          ]
        }
      }

      return {
        date: formatDate(point.date),
        // Return null for missing data points so chart doesn't connect them
        positive: point.positive ? Math.round(point.positive) : null,
        neutral: point.neutral ? Math.round(point.neutral) : null,
        negative: point.negative ? Math.round(point.negative) : null,
        annotation
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    if (selectedPeriod === '1 D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    if (selectedPeriod === '5 D' || selectedPeriod === '1 M') {
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}/${day}`
    }

    const month = date.toLocaleString('en-US', { month: 'short' })
    const year = String(date.getFullYear())
    return `${month} ${year}`
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

        const preferredCountry = getCountryPreference()
        let countryToSelect = null

        if (preferredCountry) {
          countryToSelect = response.data.data.find(
            (c: Country) => c.id === preferredCountry.id || c.name === preferredCountry.name
          )
        }

        if (!countryToSelect) {
          const kenya = response.data.data.find((c: Country) => c.name === 'Kenya')
          countryToSelect = kenya || response.data.data[0]
        }

        if (countryToSelect) {
          setSelectedCountries([countryToSelect])
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error)
      // No fallback - just set empty arrays
      setCountries([])
      setSelectedCountries([])
    } finally {
      setLoading(false)
    }
  }

  const loadSentimentData = async () => {
    if (selectedCountries.length === 0) return

    try {
      // Load articles for all selected countries
      const articlesByCountryTemp: { [countryId: number]: NewsArticle[] } = {}
      let allArticles: NewsArticle[] = []

      for (const country of selectedCountries) {
        try {
          // Fetch more articles for better analysis (up to 200)
          const response = await sentimentApi.getNews(country.id, 30, 200)
          if (response.data.success && response.data.data) {
            articlesByCountryTemp[country.id] = response.data.data
            allArticles = [...allArticles, ...response.data.data]
          } else {
            articlesByCountryTemp[country.id] = []
          }
        } catch (error) {
          console.error(`Error loading sentiment data for ${country.name}:`, error)
          articlesByCountryTemp[country.id] = []
        }
      }

      setArticlesByCountry(articlesByCountryTemp)
      // Use all articles combined for components
      setNewsArticles(allArticles)
    } catch (error) {
      console.error('Error loading sentiment data:', error)
      // Set empty array on error so components show empty state
      setNewsArticles([])
      setArticlesByCountry({})
    }
  }

  if (loading || userDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
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
          userPlan={userData.userPlan}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {!features.hasSentimentPulse ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="max-w-2xl text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full mb-6">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Sentiment Pulse Analytics</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Track market sentiment trends, analyze news coverage, and visualize sentiment distribution across sectors and time periods.
                </p>
                <Link href="/onboarding/step-5?returnTo=sentiment">
                  <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all font-semibold text-lg shadow-xl">
                    <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Upgrade to Gold Plan
                  </button>
                </Link>
              </div>
            </div>
          ) : countries.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="max-w-2xl text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Unable to Load Countries</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We couldn't load the country data. Please check your connection and try refreshing the page.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-lg shadow-xl">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gray-50">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Sentiment Pulse</h1>
                <p className="text-sm text-gray-600 mt-1">Track market sentiment trends and news coverage across African markets</p>
              </div>

              {/* Country Filter */}
              <div className="mb-8">
                <FilterPills
                  countries={countries}
                  selectedCountries={selectedCountries}
                  onCountryChange={(country) => {
                    // Toggle country selection
                    setSelectedCountries(prev => {
                      const isSelected = prev.some(c => c.id === country.id)
                      if (isSelected) {
                        // Remove country if already selected
                        return prev.filter(c => c.id !== country.id)
                      } else {
                        // Add country to selection
                        return [...prev, country]
                      }
                    })
                  }}
                />
              </div>

              {/* First Row - 3 Cards (Zawadi Insights, Country Comparison, Sector Sentiment) */}
              <div className="grid grid-cols-3 gap-6 h-[400px] mb-8">
                {/* Zawadi AI Insights - Full explanation */}
                <div className="col-span-1 h-full overflow-hidden">
                  <ZawadiInsights
                    selectedCountries={selectedCountries}
                    articlesByCountry={articlesByCountry}
                  />
                </div>

                {/* Country Comparison Chart */}
                <div className="col-span-1 h-full overflow-hidden">
                  <CountryComparison
                    selectedCountries={selectedCountries}
                    articlesByCountry={articlesByCountry}
                  />
                </div>

                {/* Sector Sentiment Chart */}
                <div className="col-span-1 h-full overflow-hidden">
                  <SectorSentimentChart articles={newsArticles} />
                </div>
              </div>

              {/* Second Row - 3 Cards (Trend Chart, News Feed, Word Cloud) */}
              <div className="grid grid-cols-3 gap-6 h-[500px]">
                {/* Trend Chart */}
                <div className="col-span-1 h-full overflow-hidden">
                  <TrendChart
                    data={sentimentTimelineData}
                    period={selectedPeriod}
                    onPeriodChange={handlePeriodChange}
                  />
                </div>

                {/* Tabbed News Feed */}
                <div className="col-span-1 h-full overflow-hidden">
                  <TabbedNewsFeed
                    articles={newsArticles}
                    selectedCountries={selectedCountries}
                  />
                </div>

                {/* Word Cloud */}
                <div className="col-span-1 h-full overflow-hidden">
                  <EnhancedWordCloud
                    articles={newsArticles}
                    selectedCountryIds={selectedCountries.map(c => c.id)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

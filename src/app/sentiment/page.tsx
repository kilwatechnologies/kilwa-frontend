'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { sentimentApi, countriesApi } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState('6 M')

  useEffect(() => {
    loadInitialData()
    const email = localStorage.getItem('user_email') || localStorage.getItem('userEmail') || 'user@example.com'
    setUserEmail(email)
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      loadSentimentData()
    }
  }, [selectedCountry])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const response = await countriesApi.getAfricanCountries()
      if (response.data.success && response.data.data) {
        setCountries(response.data.data)
        // Default to Kenya
        const kenya = response.data.data.find((c: Country) => c.name === 'Kenya')
        setSelectedCountry(kenya || response.data.data[0])
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

  const getTruncatedUsername = (email: string) => {
    const username = getUsernameFromEmail(email)
    return username.length > 5 ? username.slice(0, 5) + '...' : username
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
        { name: 'Positive', value: 40, color: '#4ADE80' },
        { name: 'Neutral', value: 25, color: '#FDE047' },
        { name: 'Negative', value: 35, color: '#F87171' },
      ]
    }

    const positive = newsArticles.filter(a => a.sentiment_label === 'positive').length
    const negative = newsArticles.filter(a => a.sentiment_label === 'negative').length
    const neutral = newsArticles.filter(a => a.sentiment_label === 'neutral').length
    const total = newsArticles.length

    return [
      { name: 'Positive', value: Math.round((positive / total) * 100), color: '#4ADE80' },
      { name: 'Neutral', value: Math.round((neutral / total) * 100), color: '#FDE047' },
      { name: 'Negative', value: Math.round((negative / total) * 100), color: '#F87171' },
    ]
  }

  // Hardcoded data for charts (as requested)
  const sentimentTimelineData = [
    { date: '01/02/25', positive: 75, neutral: 60, negative: 50 },
    { date: '01/15/25', positive: 90, neutral: 75, negative: 55 },
    { date: '01/27/25', positive: 95, neutral: 70, negative: 85 },
    { date: '02/02/25', positive: 70, neutral: 50, negative: 75 },
    { date: '02/15/25', positive: 65, neutral: 45, negative: 70 },
    { date: '03/02/25', positive: 100, neutral: 60, negative: 70 },
    { date: '03/15/25', positive: 95, neutral: 50, negative: 50 },
    { date: '04/02/25', positive: 30, neutral: 20, negative: 25 },
    { date: '04/15/25', positive: 30, neutral: 15, negative: 20 },
    { date: '05/02/25', positive: 25, neutral: 20, negative: 15 },
  ]

  const sectorsData = [
    { name: 'Agriculture', positive: 90, neutral: 10, negative: 0 },
    { name: 'Energy', positive: 56, neutral: 0, negative: 44 },
    { name: 'Healthcare', positive: 45, neutral: 30, negative: 25 },
    { name: 'Mining', positive: 20, neutral: 30, negative: 50 },
    { name: 'Fintech', positive: 20, neutral: 0, negative: 80 },
    { name: 'Infrastructure', positive: 10, neutral: 50, negative: 40 },
  ]

  const periods = ['1 D', '5 D', '1 M', '3 M', '6 M', 'YTD', '1 Y', '5 Y', '10 Y']

  // Calculate sentiment mix dynamically from news articles
  const sentimentMixData = calculateSentimentMix()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
          userName={getUsernameFromEmail(userEmail)}
          userInitials={getInitialsFromEmail(userEmail)}
          truncatedName={getTruncatedUsername(userEmail)}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {/* Country Selector and Date */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {selectedCountry && (
                <>
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                    {getCountryFlag(selectedCountry.name) ? (
                      <Image
                        src={getCountryFlag(selectedCountry.name)!}
                        alt={selectedCountry.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">🌍</span>
                    )}
                  </div>
                  <select
                    value={selectedCountry.id}
                    onChange={(e) => {
                      const country = countries.find(c => c.id === parseInt(e.target.value))
                      setSelectedCountry(country || null)
                    }}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>{country.name}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Sunday, 12 September, 2025</span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Sentiment Over Time */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Sentiment Over Time</h2>
                <p className="text-gray-500 text-sm">Confidence-based outlook for market entry over the next 6 months.</p>
              </div>

              {/* Period Selector */}
              <div className="flex gap-2 mb-6">
                {periods.map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      selectedPeriod === period
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-gray-600">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Negative</span>
                </div>
              </div>

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />

                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                    
                    itemStyle={{ color: '#6b7280' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="positive" stroke="#4ADE80" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="neutral" stroke="#FBBF24" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="negative" stroke="#F87171" strokeWidth={2} dot={{ r: 4 }} />
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

            {/* Top Positive Sectors */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Top Positive Sectors by Sentiment</h2>
                <p className="text-gray-500 text-sm">Highlights where investor confidence is rising or falling.</p>
              </div>

              {/* Legend */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-gray-600">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Negative</span>
                </div>
              </div>

              {/* Stacked Bars */}
              <div className="space-y-5">
                {sectorsData.map((sector) => (
                  <div key={sector.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-medium">{sector.name}</span>
                      <span className="text-sm text-gray-900 font-semibold">{sector.positive}%</span>
                    </div>
                    <div className="flex h-8 rounded-full overflow-hidden bg-gray-100">
                      {sector.positive > 0 && (
                        <div
                          style={{ width: `${sector.positive}%` }}
                          className="bg-green-500 flex items-center justify-center relative"
                        >
                          {sector.name === 'Agriculture' && (
                            <span className="text-xs text-white font-semibold px-3 py-1 bg-gray-900 rounded-full absolute">30%</span>
                          )}
                        </div>
                      )}
                      {sector.neutral > 0 && (
                        <div style={{ width: `${sector.neutral}%` }} className="bg-yellow-400"></div>
                      )}
                      {sector.negative > 0 && (
                        <div style={{ width: `${sector.negative}%` }} className="bg-red-500"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal Cards */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Signal Cards</h2>
                <p className="text-gray-500 text-sm">Highlights why investor confidence is declining across sectors.</p>
              </div>

              <div className="space-y-3">
                {newsArticles.slice(0, 4).map((article) => (
                  <div key={article.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                    <h3 className="text-gray-900 text-sm font-medium mb-3 leading-snug">{article.title}</h3>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getCategoryColor(article.topics?.[0] || 'Economics')}`}>
                          {article.topics?.[0] || 'Economics'}
                        </span>
                        {article.sentiment_label && (
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getSentimentBadgeColor(article.sentiment_label)}`}>
                            {article.sentiment_label}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{getRelativeTime(article.published_at)}</span>
                    </div>
                  </div>
                ))}

                {/* Fallback when no articles */}
                {newsArticles.length === 0 && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                      <h3 className="text-gray-900 text-sm font-medium mb-3 leading-snug">Central Bank of Ghana delays interest rate hike amid inflation surge</h3>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Economics</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">EUR→X 0.15%</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Neutral</span>
                        </div>
                        <span className="text-xs text-gray-500">Today · 1h ago</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                      <h3 className="text-gray-900 text-sm font-medium mb-3 leading-snug">Kenya introduces tax holiday for renewable energy investors</h3>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">Policy</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">Positive</span>
                        </div>
                        <span className="text-xs text-gray-500">Today · 1h ago</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                      <h3 className="text-gray-900 text-sm font-medium mb-3 leading-snug">Protests erupt over subsidy rollback in Ethiopia's capital</h3>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">Regulation</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">Negative</span>
                        </div>
                        <span className="text-xs text-gray-500">Today · 1h ago</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                      <h3 className="text-gray-900 text-sm font-medium mb-3 leading-snug">Rwanda signs $200M deal to digitize public infrastructure</h3>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Infrastructure</span>
                        </div>
                        <span className="text-xs text-gray-500">Today · 2h ago</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sentiment Mix */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-1">Sentiment Mix</h2>
                <p className="text-gray-500 text-sm">Confidence-based outlook for market entry over the next 6 months.</p>
              </div>

              {/* Legend */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-gray-600">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Negative</span>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="flex items-center justify-center">
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
                      label={({ value }) => `${value}%`}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

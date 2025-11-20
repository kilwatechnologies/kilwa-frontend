'use client'

import { useMemo } from 'react'

interface NewsArticle {
  id: number
  title: string
  source: string
  published_at: string
  sentiment_label: string
  sentiment_score: number
  topics: string[]
  country_id?: number
}

interface Country {
  id: number
  name: string
  isoCode: string
}

interface CountrySentiment {
  country: Country
  positive: number
  neutral: number
  negative: number
  total: number
}

interface CountryComparisonProps {
  selectedCountries: Country[]
  articlesByCountry: { [countryId: number]: NewsArticle[] }
}

// Helper to get 3-letter country code from name
const getCountryCode = (countryName: string): string => {
  const codes: { [key: string]: string } = {
    'Egypt': 'EGY',
    'Morocco': 'MRC',
    'Cameroon': 'CMR',
    'Kenya': 'KEN',
    'Nigeria': 'NGA',
    'South Africa': 'ZAF',
    'Ghana': 'GHA',
    'Tunisia': 'TUN',
    'Mauritius': 'MUS',
    'Rwanda': 'RWA',
    'Botswana': 'BWA'
  }
  return codes[countryName] || countryName.substring(0, 3).toUpperCase()
}

export default function CountryComparison({ selectedCountries, articlesByCountry }: CountryComparisonProps) {
  // Calculate sentiment data for each country
  const countryData = useMemo(() => {
    if (!selectedCountries || selectedCountries.length === 0) {
      return []
    }

    const data: CountrySentiment[] = []

    selectedCountries.forEach(country => {
      const articles = articlesByCountry[country.id] || []

      if (articles.length > 0) {
        const positive = articles.filter(a => a.sentiment_label === 'positive').length
        const neutral = articles.filter(a => a.sentiment_label === 'neutral').length
        const negative = articles.filter(a => a.sentiment_label === 'negative').length

        data.push({
          country,
          positive: Math.round((positive / articles.length) * 100),
          neutral: Math.round((neutral / articles.length) * 100),
          negative: Math.round((negative / articles.length) * 100),
          total: articles.length
        })
      }
    })

    return data
  }, [selectedCountries, articlesByCountry])

  // Find max value for scaling bars
  const maxValue = useMemo(() => {
    if (countryData.length === 0) return 100
    const allValues = countryData.flatMap(d => [d.positive, d.neutral, d.negative])
    return Math.max(...allValues, 20) // At least 20 for scaling
  }, [countryData])

  if (countryData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
        <div className="p-6 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Country Sentiment Comparison</h2>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Select multiple countries to compare sentiment</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex-shrink-0 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">Country Sentiment Comparison</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
        {/* Header with Country Codes */}
        <div className="flex items-start mb-5">
          <div className="w-24 flex-shrink-0"></div>
          <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: `repeat(${countryData.length}, 1fr)` }}>
            {countryData.map((data, index) => (
              <div key={index} className="text-center">
                <div className="text-sm font-bold text-gray-900 bg-gray-100 py-2 rounded-lg tracking-wide">
                  {getCountryCode(data.country.name)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Rows */}
        <div className="space-y-4">
          {/* POSITIVE */}
          <div className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0">
              <div className="text-xs font-bold text-green-700 uppercase tracking-wide bg-green-50 px-2 py-1.5 rounded">POSITIVE</div>
            </div>
            <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: `repeat(${countryData.length}, 1fr)` }}>
              {countryData.map((data, index) => (
                <div key={index}>
                  <div className="h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <span className="text-white font-bold text-sm">{data.positive}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEUTRAL */}
          <div className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-2 py-1.5 rounded">NEUTRAL</div>
            </div>
            <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: `repeat(${countryData.length}, 1fr)` }}>
              {countryData.map((data, index) => (
                <div key={index}>
                  <div className="h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <span className="text-white font-bold text-sm">{data.neutral}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEGATIVE */}
          <div className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wide bg-amber-50 px-2 py-1.5 rounded">NEGATIVE</div>
            </div>
            <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: `repeat(${countryData.length}, 1fr)` }}>
              {countryData.map((data, index) => (
                <div key={index}>
                  <div className="h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <span className="text-white font-bold text-sm">{data.negative}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

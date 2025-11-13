'use client'

import { useState } from 'react'

interface NewsArticle {
  id: number
  title: string
  source: string
  published_at: string
  sentiment_label: string
  topics: string[]
  url: string
  country_id?: number
  engagement?: {
    likes?: number
    retweets?: number
    mentions?: number
  }
}

interface Country {
  id: number
  name: string
  isoCode: string
}

interface TabbedNewsFeedProps {
  articles: NewsArticle[]
  selectedCountries?: Country[]
}

export default function TabbedNewsFeed({ articles, selectedCountries = [] }: TabbedNewsFeedProps) {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive')

  // Helper to get country name from ID
  const getCountryName = (countryId?: number): string => {
    if (!countryId || selectedCountries.length === 0) return ''
    const country = selectedCountries.find(c => c.id === countryId)
    return country?.name || ''
  }

  // Helper to get country flag emoji
  const getFlagEmoji = (countryId?: number): string => {
    if (!countryId || selectedCountries.length === 0) return ''
    const country = selectedCountries.find(c => c.id === countryId)
    if (!country || !country.isoCode || country.isoCode.length !== 2) return ''

    const codePoints = country.isoCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))

    return String.fromCodePoint(...codePoints)
  }

  const positiveArticles = articles.filter(a => a.sentiment_label === 'positive')
  const negativeArticles = articles.filter(a => a.sentiment_label === 'negative')

  const displayArticles = activeTab === 'positive' ? positiveArticles : negativeArticles

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return '<1h ago'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1d ago'
    return `${diffDays}d ago`
  }

  const getSourceIcon = (source: string) => {
    // Return a colored circle for source avatar
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
    const index = source.length % colors.length
    return colors[index]
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setActiveTab('positive')}
          className={`flex-1 py-2.5 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'positive'
              ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Positive News
        </button>
        <button
          onClick={() => setActiveTab('negative')}
          className={`flex-1 py-2.5 px-4 font-semibold text-sm transition-colors ${
            activeTab === 'negative'
              ? 'bg-red-50 text-red-700 border-b-2 border-red-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Negative News
        </button>
      </div>

      {/* News Cards - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-200">
        {displayArticles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                No {activeTab} articles found
              </p>
            </div>
          </div>
        ) : (
          displayArticles.slice(0, 10).map((article, index) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-2.5">
                {/* Source Avatar */}
                <div className={`w-7 h-7 rounded-full ${getSourceIcon(article.source)} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-xs">
                    {article.source.substring(0, 1).toUpperCase()}
                  </span>
                </div>

                {/* Article Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900 text-xs truncate">{article.source}</span>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-gray-500 text-xs flex-shrink-0">{getRelativeTime(article.published_at)}</span>

                    {/* Country Badge (only show when multiple countries selected) */}
                    {selectedCountries.length > 1 && article.country_id && (
                      <>
                        <span className="text-gray-400 text-xs">•</span>
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span>{getFlagEmoji(article.country_id)}</span>
                          <span className="text-gray-600">{getCountryName(article.country_id)}</span>
                        </span>
                      </>
                    )}
                  </div>

                  <h4 className="text-gray-800 text-xs leading-relaxed line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h4>

                  {/* Tags */}
                  {article.topics && article.topics.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {article.topics.slice(0, 2).map((topic, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Link Icon */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      {displayArticles.length > 0 && (
        <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-center flex-shrink-0">
          <p className="text-gray-600 text-xs">
            Showing {Math.min(10, displayArticles.length)} of {displayArticles.length} {activeTab} articles
            {selectedCountries.length > 1 && ` across ${selectedCountries.length} countries`}
          </p>
        </div>
      )}
    </div>
  )
}

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
}

interface Insight {
  country: string
  sentiment: string
  percentage: string
  description: string
  isPositive: boolean
}

interface Country {
  id: number
  name: string
  isoCode: string
}

interface ZawadiInsightsProps {
  selectedCountries: Country[]
  articlesByCountry: { [countryId: number]: NewsArticle[] }
}

export default function ZawadiInsights({ selectedCountries, articlesByCountry }: ZawadiInsightsProps) {
  // Generate real AI insights from article data
  const insights = useMemo(() => {
    if (!selectedCountries || selectedCountries.length === 0) {
      return []
    }

    const generatedInsights: Insight[] = []

    // Generate insights for each selected country
    selectedCountries.forEach(country => {
      const articles = articlesByCountry[country.id] || []

      if (articles.length === 0) {
        return // Skip countries with no articles
      }

      // Calculate sentiment for this country
      const totalArticles = articles.length
      const positiveArticles = articles.filter(a => a.sentiment_label === 'positive')
      const negativeArticles = articles.filter(a => a.sentiment_label === 'negative')
      const neutralArticles = articles.filter(a => a.sentiment_label === 'neutral')

      const positivePercent = Math.round((positiveArticles.length / totalArticles) * 100)
      const negativePercent = Math.round((negativeArticles.length / totalArticles) * 100)
      const neutralPercent = Math.round((neutralArticles.length / totalArticles) * 100)

      // Calculate average sentiment score
      const avgSentiment = articles.reduce((sum, a) => sum + (a.sentiment_score || 0), 0) / totalArticles
      const sentimentChange = Math.round(avgSentiment * 100)

      // Find dominant topics
      const topicCounts: { [key: string]: number } = {}
      articles.forEach(article => {
        if (article.topics && article.topics.length > 0) {
          article.topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1
          })
        }
      })

      const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic]) => topic)

      // Find top positive and negative drivers
      const positiveTopics: { [key: string]: number } = {}
      const negativeTopics: { [key: string]: number } = {}

      positiveArticles.forEach(article => {
        if (article.topics) {
          article.topics.forEach(topic => {
            positiveTopics[topic] = (positiveTopics[topic] || 0) + 1
          })
        }
      })

      negativeArticles.forEach(article => {
        if (article.topics) {
          article.topics.forEach(topic => {
            negativeTopics[topic] = (negativeTopics[topic] || 0) + 1
          })
        }
      })

      const topPositiveTopic = Object.entries(positiveTopics).sort((a, b) => b[1] - a[1])[0]?.[0] || 'economic policy'
      const topNegativeTopic = Object.entries(negativeTopics).sort((a, b) => b[1] - a[1])[0]?.[0] || 'market volatility'

      // Generate insight for this country
      if (positivePercent > negativePercent) {
        const driver = topPositiveTopic.toLowerCase()
        generatedInsights.push({
          country: country.name,
          sentiment: 'positive',
          percentage: sentimentChange > 0 ? `+${sentimentChange}%` : `${sentimentChange}%`,
          description: `showing ${positivePercent > 60 ? 'strong' : 'moderate'} positive sentiment (${positivePercent}% positive coverage) driven by ${driver}${sortedTopics.length > 1 ? ` and ${sortedTopics[1].toLowerCase()}` : ''} developments flagged across ${totalArticles} news sources, ${positivePercent > 50 ? 'reducing' : 'maintaining'} risk premium considerations.`,
          isPositive: true
        })
      } else if (negativePercent > positivePercent) {
        const driver = topNegativeTopic.toLowerCase()
        generatedInsights.push({
          country: country.name,
          sentiment: 'negative',
          percentage: sentimentChange > 0 ? `+${Math.abs(sentimentChange)}%` : `-${Math.abs(sentimentChange)}%`,
          description: `showing ${negativePercent > 60 ? 'strong' : 'moderate'} negative sentiment (${negativePercent}% negative coverage) driven by ${driver}${sortedTopics.length > 1 ? ` and ${sortedTopics[1].toLowerCase()}` : ''} concerns flagged in local and international media, increasing risk premium on investment decisions.`,
          isPositive: false
        })
      } else {
        generatedInsights.push({
          country: country.name,
          sentiment: 'neutral',
          percentage: `${Math.abs(sentimentChange)}%`,
          description: `showing balanced sentiment (${neutralPercent}% neutral coverage) with mixed signals from ${sortedTopics[0]?.toLowerCase() || 'various sectors'}, suggesting a wait-and-see approach from investors and market participants.`,
          isPositive: avgSentiment >= 0
        })
      }
    })

    return generatedInsights.slice(0, 3) // Limit to 3 insights max
  }, [selectedCountries, articlesByCountry])

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
        <div className="p-6 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            <span className="text-purple-600">Zawadi</span> AI Insights
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Select a country with recent news coverage to view insights
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex-shrink-0 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900">Zawadi AI Insights</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
        <ul className="space-y-3.5">
          {insights.map((insight, index) => (
            <li key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-purple-50 transition-colors">
              <span className="text-purple-400 mt-0.5 flex-shrink-0 font-bold">•</span>
              <p className="text-gray-700 leading-relaxed text-sm">
                <span className="font-bold text-gray-900">{insight.country}</span> is{' '}
                <span className="italic">{insight.description}</span>{' '}
                {insight.isPositive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {insight.percentage} ↑
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    {insight.percentage} ↓
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>

        {/* AI Badge */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 7H7v6h6V7z" />
              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>
            <span>AI-powered analysis from {Object.values(articlesByCountry).flat().length} news sources</span>
          </div>
        </div>
      </div>
    </div>
  )
}

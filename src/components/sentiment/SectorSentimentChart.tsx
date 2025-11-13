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

interface SectorSentiment {
  sector: string
  positive: number
  neutral: number
  negative: number
  articleCount: number
}

interface SectorSentimentChartProps {
  articles: NewsArticle[]
}

export default function SectorSentimentChart({ articles }: SectorSentimentChartProps) {
  // Define sectors with their topic keywords
  const sectorDefinitions = [
    {
      name: 'ENERGY & RENEWABLE ENERGY',
      keywords: ['energy', 'power', 'electricity', 'renewable', 'solar', 'wind', 'hydro', 'oil', 'gas', 'petroleum']
    },
    {
      name: 'AGRICULTURE AND AGRIBUSINESS',
      keywords: ['agriculture', 'farming', 'agribusiness', 'crop', 'livestock', 'food security', 'agricultural']
    },
    {
      name: 'TECHNOLOGY & FINTECH',
      keywords: ['technology', 'tech', 'fintech', 'digital', 'innovation', 'startup', 'software', 'mobile', 'internet']
    },
    {
      name: 'INFRASTRUCTURE & REAL ESTATE',
      keywords: ['infrastructure', 'construction', 'real estate', 'housing', 'transport', 'railway', 'road', 'building']
    },
    {
      name: 'MANUFACTURING & INDUSTRIALIZATION',
      keywords: ['manufacturing', 'industry', 'industrial', 'factory', 'production', 'textile', 'automotive']
    }
  ]

  // Calculate real sentiment data from articles
  const sectorData = useMemo(() => {
    if (!articles || articles.length === 0) {
      return []
    }

    const calculateSectorSentiment = (keywords: string[]): Omit<SectorSentiment, 'sector'> | null => {
      // Filter articles that match this sector
      const sectorArticles = articles.filter(article => {
        if (!article.topics || article.topics.length === 0) {
          const titleLower = article.title.toLowerCase()
          return keywords.some(keyword => titleLower.includes(keyword.toLowerCase()))
        }

        return article.topics.some(topic =>
          keywords.some(keyword =>
            topic.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(topic.toLowerCase())
          )
        )
      })

      // Need at least 2 articles to show meaningful data
      if (sectorArticles.length < 2) {
        return null
      }

      // Calculate sentiment distribution
      const positive = sectorArticles.filter(a => a.sentiment_label === 'positive').length
      const negative = sectorArticles.filter(a => a.sentiment_label === 'negative').length
      const neutral = sectorArticles.filter(a => a.sentiment_label === 'neutral').length
      const total = sectorArticles.length

      // Calculate percentages
      const positivePercent = Math.round((positive / total) * 100)
      const negativePercent = Math.round((negative / total) * 100)
      const neutralPercent = Math.round((neutral / total) * 100)

      return {
        positive: positivePercent,
        neutral: neutralPercent,
        negative: negativePercent,
        articleCount: total
      }
    }

    // Calculate sentiment for each sector
    const sectors: (SectorSentiment & { sector: string })[] = []
    for (const sectorDef of sectorDefinitions) {
      const sentiment = calculateSectorSentiment(sectorDef.keywords)
      if (sentiment) {
        sectors.push({
          sector: sectorDef.name,
          ...sentiment
        })
      }
    }

    return sectors
  }, [articles])

  if (sectorData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
        <div className="p-6 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Sentiment by Sector</h2>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Insufficient articles to analyze sector sentiment
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5 flex-shrink-0 bg-gradient-to-br from-emerald-50 to-white border-b border-emerald-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-gray-900">Sentiment by Sector</h2>
        </div>
        {/* Header */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="text-xs font-bold text-green-700 uppercase tracking-wide bg-green-50 py-1.5 rounded">POSITIVE</div>
          <div className="text-xs font-bold text-blue-700 uppercase tracking-wide bg-blue-50 py-1.5 rounded">NEUTRAL</div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wide bg-amber-50 py-1.5 rounded">NEGATIVE</div>
        </div>
      </div>

      {/* Sector Rows - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
        <div className="space-y-4">
          {sectorData.map((sector, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
              {/* Sector Name */}
              <div className="mb-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  {sector.sector}
                </h3>
              </div>

              {/* Sentiment Bars */}
              <div className="grid grid-cols-3 gap-3">
                {/* Positive Bar */}
                <div>
                  <div className="h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <span className="text-white font-bold text-sm">{sector.positive}%</span>
                  </div>
                </div>

                {/* Neutral Bar */}
                <div>
                  <div className="h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <span className="text-white font-bold text-sm">{sector.neutral}%</span>
                  </div>
                </div>

                {/* Negative Bar */}
                <div>
                  <div className="h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                    <span className="text-white font-bold text-sm">{sector.negative}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <span>Analysis of {articles.length} articles across {sectorData.length} sectors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

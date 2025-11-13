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
  positive: { small: number; large: number }
  neutral: { small: number; large: number }
  negative: { small: number; large: number }
  articleCount: number
}

interface SentimentMatrixProps {
  articles: NewsArticle[]
}

export default function SentimentMatrix({ articles }: SentimentMatrixProps) {
  // Define sectors with their topic keywords
  const sectorDefinitions = [
    {
      name: 'ENERGY & RENEWABLE ENERGY',
      keywords: ['energy', 'power', 'electricity', 'renewable', 'solar', 'wind', 'hydro', 'oil', 'gas', 'petroleum', 'fossil', 'nuclear', 'biomass']
    },
    {
      name: 'AGRICULTURE AND AGRIBUSINESS',
      keywords: ['agriculture', 'farming', 'agribusiness', 'crop', 'livestock', 'food security', 'irrigation', 'harvest', 'agricultural', 'agri']
    },
    {
      name: 'TECHNOLOGY & FINTECH',
      keywords: ['technology', 'tech', 'fintech', 'digital', 'innovation', 'startup', 'software', 'mobile', 'internet', 'ai', 'blockchain', 'cryptocurrency']
    },
    {
      name: 'INFRASTRUCTURE & REAL ESTATE',
      keywords: ['infrastructure', 'construction', 'real estate', 'housing', 'transport', 'railway', 'road', 'bridge', 'port', 'airport', 'building']
    },
    {
      name: 'MANUFACTURING & INDUSTRIALIZATION',
      keywords: ['manufacturing', 'industry', 'industrial', 'factory', 'production', 'assembly', 'processing', 'textile', 'automotive', 'machinery']
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
          // Fallback to searching in title if no topics
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

      // Calculate average sentiment scores for each category
      const positiveScores = sectorArticles
        .filter(a => a.sentiment_label === 'positive')
        .map(a => a.sentiment_score || 0)
      const negativeScores = sectorArticles
        .filter(a => a.sentiment_label === 'negative')
        .map(a => Math.abs(a.sentiment_score || 0))
      const neutralScores = sectorArticles
        .filter(a => a.sentiment_label === 'neutral')
        .map(a => Math.abs(a.sentiment_score || 0))

      // Calculate intensity (small bar = count %, large bar = intensity %)
      const avgPositiveIntensity = positiveScores.length > 0
        ? Math.round((positiveScores.reduce((a, b) => a + b, 0) / positiveScores.length) * 100)
        : 0
      const avgNegativeIntensity = negativeScores.length > 0
        ? Math.round((negativeScores.reduce((a, b) => a + b, 0) / negativeScores.length) * 100)
        : 0
      const avgNeutralIntensity = neutralScores.length > 0
        ? Math.round((neutralScores.reduce((a, b) => a + b, 0) / neutralScores.length) * 100)
        : 0

      return {
        positive: {
          small: positivePercent,
          large: avgPositiveIntensity
        },
        neutral: {
          small: neutralPercent,
          large: avgNeutralIntensity
        },
        negative: {
          small: negativePercent,
          large: avgNegativeIntensity
        },
        articleCount: total
      }
    }

    // Calculate sentiment for each sector
    const sectors: SectorSentiment[] = []
    for (const sector of sectorDefinitions) {
      const sentiment = calculateSectorSentiment(sector.keywords)
      if (sentiment) {
        sectors.push({
          sector: sector.name,
          ...sentiment
        })
      }
    }

    // Sort by positive sentiment (descending) - sectors with higher positive sentiment first
    sectors.sort((a, b) => b.positive.small - a.positive.small)

    return sectors
  }, [articles])

  const BarPair = ({ small, large, sentiment }: { small: number; large: number; sentiment: 'positive' | 'neutral' | 'negative' }) => {
    let smallColor = 'bg-cyan-400'
    let largeColor = 'bg-teal-400'

    if (sentiment === 'neutral') {
      smallColor = 'bg-sky-300'
      largeColor = 'bg-sky-400'
    } else if (sentiment === 'negative') {
      smallColor = 'bg-orange-300'
      largeColor = 'bg-red-400'
    }

    // Don't show bars if values are 0
    if (small === 0 && large === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-gray-400">No data</span>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        {small > 0 && (
          <div className={`${smallColor} h-8 rounded-md flex items-center justify-center transition-all hover:scale-105`}>
            <span className="text-white font-semibold text-sm">{small}%</span>
          </div>
        )}
        {large > 0 && (
          <div className={`${largeColor} h-8 rounded-md flex items-center justify-center transition-all hover:scale-105`}>
            <span className="text-white font-semibold text-sm">{large}%</span>
          </div>
        )}
      </div>
    )
  }

  if (sectorData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-md p-8 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sector Data Available</h3>
        <p className="text-sm text-gray-600">
          Insufficient articles to calculate sector sentiment. Try selecting a different country or time period.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
      {/* Title */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Sentiment by Sector</span>
        </h2>
      </div>

      {/* Header */}
      <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
        <div className="p-4"></div>
        <div className="p-4 text-center">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">POSITIVE</h3>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">NEUTRAL</h3>
        </div>
        <div className="p-4 text-center">
          <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">NEGATIVE</h3>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {sectorData.map((sector, index) => (
          <div key={index} className="grid grid-cols-4 hover:bg-gray-50 transition-colors">
            {/* Sector Name */}
            <div className="p-4 flex flex-col justify-center">
              <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide leading-tight mb-1">
                {sector.sector}
              </h4>
              <span className="text-xs text-gray-500">{sector.articleCount} articles</span>
            </div>

            {/* Positive Bars */}
            <div className="p-4">
              <BarPair small={sector.positive.small} large={sector.positive.large} sentiment="positive" />
            </div>

            {/* Neutral Bars */}
            <div className="p-4">
              <BarPair small={sector.neutral.small} large={sector.neutral.large} sentiment="neutral" />
            </div>

            {/* Negative Bars */}
            <div className="p-4">
              <BarPair small={sector.negative.small} large={sector.negative.large} sentiment="negative" />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-400"></div>
            <span>Small bar: % of articles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-teal-400"></div>
            <span>Large bar: Sentiment intensity</span>
          </div>
        </div>
      </div>
    </div>
  )
}

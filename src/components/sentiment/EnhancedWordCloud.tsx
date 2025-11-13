'use client'

import { useMemo, useEffect, useState } from 'react'
import { TagCloud } from 'react-tagcloud'

interface NewsArticle {
  id: number
  title: string
  source: string
  published_at: string
  sentiment_label: string
  topics: string[]
  country_id?: number
}

interface GoogleTrend {
  keyword: string
  total_count?: number
  count?: number
  countries?: string[]
}

interface WordCloudProps {
  articles: NewsArticle[]
  selectedCountryIds?: number[]
}

export default function EnhancedWordCloud({ articles, selectedCountryIds = [] }: WordCloudProps) {
  const [googleTrends, setGoogleTrends] = useState<GoogleTrend[]>([])
  const [loading, setLoading] = useState(false)
  const [useGoogleTrends, setUseGoogleTrends] = useState(true)

  // Fetch Google Trends data when countries change
  useEffect(() => {
    const fetchGoogleTrends = async () => {
      if (!selectedCountryIds || selectedCountryIds.length === 0) {
        setUseGoogleTrends(false)
        return
      }

      setLoading(true)
      try {
        const countryIdsParam = selectedCountryIds.join(',')
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sentiment/google-trends?country_ids=${countryIdsParam}`
        )

        const result = await response.json()

        if (result.success && result.data?.trends) {
          setGoogleTrends(result.data.trends)
          setUseGoogleTrends(true)
        } else {
          console.warn('Failed to fetch Google Trends, falling back to article keywords')
          setUseGoogleTrends(false)
        }
      } catch (error) {
        console.error('Error fetching Google Trends:', error)
        setUseGoogleTrends(false)
      } finally {
        setLoading(false)
      }
    }

    fetchGoogleTrends()
  }, [selectedCountryIds])

  // Extract real keywords from positive articles or use Google Trends
  const wordCloudData = useMemo(() => {
    // Use Google Trends data if available
    if (useGoogleTrends && googleTrends.length > 0) {
      return googleTrends.map(trend => ({
        value: trend.keyword,
        count: trend.total_count || trend.count || 10
      }))
    }

    // Fallback to article-based keywords
    if (!articles || articles.length === 0) {
      return []
    }

    // Filter positive articles for the word cloud
    const positiveArticles = articles.filter(a => a.sentiment_label === 'positive')

    if (positiveArticles.length === 0) {
      return []
    }

    const wordFrequency: { [key: string]: number } = {}

    // Common words to exclude (stop words)
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'as', 'this', 'that', 'these', 'those', 'it', 'its', 'their', 'there', 'they', 'them', 'we', 'our', 'us', 'you', 'your', 'into', 'over', 'after', 'who', 'what', 'when', 'where', 'which', 'while', 'about', 'than', 'more', 'most', 'some', 'all', 'both', 'each', 'few', 'any', 'such', 'only', 'own', 'same', 'so', 'just', 'very', 'too', 'also', 'here', 'how', 'now', 'then', 'well', 'even', 'still', 'back', 'through', 'out', 'up', 'down', 'off', 'again', 'further', 'once'
    ])

    // Negative/concerning words to exclude
    const negativeWords = new Set([
      'crisis', 'scandal', 'corruption', 'fraud', 'illegal', 'violence', 'attack', 'death', 'kill', 'murder', 'rape', 'abuse', 'exploitation', 'trafficking', 'sexual', 'threat', 'war', 'conflict', 'protest', 'strike', 'riot', 'collapse', 'fail', 'failure', 'crash', 'decline', 'loss', 'debt', 'poverty', 'unemployment', 'inflation', 'recession', 'warn', 'warning', 'danger', 'risk', 'concern', 'worry', 'fear', 'arrests', 'arrested', 'charged', 'convicted', 'guilty', 'crime', 'criminal', 'victim', 'injured', 'wounded', 'disaster', 'emergency', 'epidemic', 'pandemic', 'disease', 'outbreak', 'shortage', 'deficit', 'bankrupt', 'insolvent', 'defaulted', 'sued', 'lawsuit', 'allegation', 'investigation', 'probe', 'delays', 'delayed', 'suspended', 'banned', 'prohibited', 'restriction', 'sanction', 'penalty', 'fine', 'breach', 'violation'
    ])

    // Investment/business-related keywords to prioritize
    const relevantKeywords = new Set([
      'investment', 'investor', 'investors', 'growth', 'expansion', 'opportunity', 'opportunities', 'innovation', 'innovative',
      'digital', 'technology', 'tech', 'fintech', 'startup', 'startups', 'enterprise', 'business', 'economy', 'economic',
      'infrastructure', 'development', 'project', 'projects', 'funding', 'capital', 'finance', 'financial', 'banking', 'bank',
      'market', 'markets', 'trade', 'export', 'exports', 'import', 'imports', 'sector', 'sectors', 'industry', 'industries',
      'manufacturing', 'agriculture', 'agribusiness', 'energy', 'renewable', 'solar', 'power', 'electricity', 'mining',
      'oil', 'gas', 'petroleum', 'healthcare', 'health', 'pharmaceutical', 'tourism', 'hospitality', 'real', 'estate',
      'construction', 'housing', 'transport', 'transportation', 'logistics', 'warehouse', 'port', 'airport', 'railway',
      'platform', 'mobile', 'internet', 'connectivity', 'network', 'telecommunications', 'telecom',
      'revenue', 'profit', 'earnings', 'income', 'returns', 'yield', 'dividend', 'stock', 'equity', 'bond', 'securities',
      'deal', 'deals', 'merger', 'acquisition', 'partnership', 'collaboration', 'joint', 'venture', 'agreement',
      'launch', 'launched', 'unveils', 'announces', 'plans', 'boost', 'increase', 'rise', 'rising', 'surge', 'soar',
      'expand', 'scale', 'upgrade', 'improve', 'enhance', 'strengthen', 'optimize', 'modernize', 'transform',
      'sustainable', 'sustainability', 'green', 'clean', 'climate', 'carbon', 'emission',
      'smart', 'intelligent', 'automated', 'automation', 'artificial', 'intelligence', 'blockchain', 'crypto',
      'jobs', 'employment', 'workforce', 'talent', 'skilled', 'training', 'education', 'capacity',
      'foreign', 'direct', 'domestic', 'local', 'regional', 'international', 'global', 'cross-border',
      'policy', 'reform', 'reforms', 'regulation', 'regulatory', 'government', 'public', 'private',
      'consumer', 'demand', 'supply', 'production', 'productivity', 'output', 'performance', 'competitive',
      'efficiency', 'effective', 'diversification', 'diversify', 'portfolio', 'asset', 'assets', 'value'
    ])

    // Extract words from titles
    positiveArticles.forEach(article => {
      const words = article.title.toLowerCase().split(/\s+/)
      words.forEach(word => {
        const cleanWord = word.replace(/[^\w]/g, '')

        // Include words that are: longer than 3 chars, not stop words, not negative words
        if (cleanWord.length > 3 &&
            !stopWords.has(cleanWord) &&
            !negativeWords.has(cleanWord)) {
          // Prioritize relevant keywords
          if (relevantKeywords.has(cleanWord)) {
            wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 3 // Triple weight for relevant words
          } else {
            wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1
          }
        }
      })
    })

    // Extract words from topics
    positiveArticles.forEach(article => {
      if (article.topics && article.topics.length > 0) {
        article.topics.forEach(topic => {
          const words = topic.toLowerCase().split(/\s+/)
          words.forEach(word => {
            const cleanWord = word.replace(/[^\w]/g, '')
            if (cleanWord.length > 3 &&
                !stopWords.has(cleanWord) &&
                !negativeWords.has(cleanWord)) {
              wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 2 // Double weight for topic words
            }
          })
        })
      }
    })

    // Get top words by frequency
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40) // Top 40 words

    // Convert to TagCloud format
    return sortedWords.map(([word, count]) => ({
      value: word,
      count: count
    }))
  }, [articles, googleTrends, useGoogleTrends])

  // Custom renderer for multi-color cloud-shaped word cloud
  const customRenderer = (tag: any, size: number) => {
    // Define vibrant color palette for word cloud
    const colors = [
      '#F59E0B', // amber/orange
      '#10B981', // emerald green
      '#06B6D4', // cyan
      '#EAB308', // yellow
      '#EF4444', // red
      '#3B82F6', // blue
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#14B8A6', // teal
      '#F97316', // orange
    ]

    // Assign color based on word characteristics
    const colorIndex = (tag.value.length + tag.count) % colors.length
    const selectedColor = colors[colorIndex]

    // Vary rotation slightly for cloud effect
    const rotation = ((tag.count % 3) - 1) * 15 // -15, 0, or 15 degrees

    return (
      <span
        key={tag.value}
        style={{
          fontSize: `${size}px`,
          color: selectedColor,
          margin: '1px 2px',
          padding: '1px 2px',
          display: 'inline-block',
          fontWeight: size > 28 ? '700' : size > 20 ? '600' : size > 14 ? '500' : '400',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: `rotate(${rotation}deg)`,
          lineHeight: '1.1',
        }}
        className="hover:scale-105 hover:opacity-80"
        title={`${tag.value} (${tag.count} ${useGoogleTrends ? 'trend score' : 'mentions'})`}
      >
        {tag.value}
      </span>
    )
  }

  if (wordCloudData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-4 flex-1 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Trending Topics</h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Insufficient positive articles to generate trending topics
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Trending Topics</h2>
            {useGoogleTrends && googleTrends.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                Google Trends
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {useGoogleTrends && googleTrends.length > 0
              ? `Real-time trends for ${selectedCountryIds.length === 1 ? 'selected country' : 'selected countries'}`
              : `Investment trends across ${selectedCountryIds.length || 'all'} ${selectedCountryIds.length === 1 ? 'country' : 'countries'}`
            }
          </p>
        </div>

        {/* Word Cloud - Responsive Container */}
        <div className="flex-1 min-h-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-2 overflow-hidden relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-xs text-gray-600">Loading trends...</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TagCloud
                minSize={11}
                maxSize={38}
                tags={wordCloudData}
                className="w-full"
                renderer={customRenderer}
                shuffle={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500">
            <span>
              {wordCloudData.length > 0
                ? `${wordCloudData.length} trending keywords from investment news`
                : 'No trending keywords available'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

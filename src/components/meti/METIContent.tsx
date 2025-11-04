'use client'

import { useState, useEffect } from 'react'
import { countriesApi, metiApi, sentimentApi, marketsApi } from '@/lib/api'
import { generateInvestmentBrief } from '@/lib/zwadiService'
import { getCountryPreference } from '@/lib/countryPreference'

interface Country {
  id: number
  name: string
  isoCode: string
}

interface METIScoreData {
  score: number
  year: number
  entryRecommendation: string
  confidenceLevel: number
  trendScore: number
  volatilityScore: number
  momentumScore: number
}

interface HistoricalMETIData {
  year: number
  score: number
  countryId: number
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

interface SectorData {
  name: string
  outlook: string
  focusMarkets: string
  value?: number
  change_percent?: number
}

interface DriverCategoryData {
  name: string
  contribution: string
  riskLevel: 'Critical' | 'Moderate' | 'Strong'
}

interface METIContentProps {
  onContentReady?: () => void
}

export default function METIContent({ onContentReady }: METIContentProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [metiScore, setMetiScore] = useState<METIScoreData | null>(null)
  const [metiLoading, setMetiLoading] = useState(false)
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [sentimentLoading, setSentimentLoading] = useState(false)
  const [sentimentPulse, setSentimentPulse] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [pulseLoading, setPulseLoading] = useState(false)
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [aiBrief, setAiBrief] = useState<{ setup: string; positioning: string; confidence: string; updatedAt: string } | null>(null)
  const [aiBriefLoading, setAiBriefLoading] = useState(false)
  const [historicalData, setHistoricalData] = useState<HistoricalMETIData[]>([])
  const [historicalLoading, setHistoricalLoading] = useState(false)
  const [selectedYearRange, setSelectedYearRange] = useState(5) // Default to 5 years
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalMETIData | null>(null)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [sectorLoading, setSectorLoading] = useState(false)

  // Sector filtering states
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set())
  const [originalMetiScore, setOriginalMetiScore] = useState<number | null>(null)
  const [originalSentimentPulse, setOriginalSentimentPulse] = useState<any>(null)
  const [allNewsArticles, setAllNewsArticles] = useState<NewsArticle[]>([])

  useEffect(() => {
    loadCountries()
    loadSectorData()
  }, [])

  // Notify parent once initial data has loaded (including chart data)
  useEffect(() => {
    if (selectedCountry && metiScore !== null && historicalData.length > 0 && onContentReady) {
      onContentReady()
    }
  }, [selectedCountry, metiScore, historicalData, onContentReady])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showCalendar && !target.closest('.calendar-container')) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCalendar])

  // Reload data when date changes
  useEffect(() => {
    if (selectedCountry) {
      loadMETIScore()
      loadSentimentData()
      loadSentimentPulse()
      loadAlerts()
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedCountry) {
      // Reset sector filters and original values when country changes
      setSelectedSectors(new Set())
      setOriginalMetiScore(null)
      setOriginalSentimentPulse(null)
      setAllNewsArticles([])

      loadMETIScore()
      loadSentimentData()
      loadSentimentPulse()
      loadAlerts()
      loadAIBrief()
      loadHistoricalMETIData()
    }
  }, [selectedCountry])

  // Watch for sector filter changes and recalculate scores
  useEffect(() => {
    if (!selectedCountry || originalMetiScore === null || allNewsArticles.length === 0) return

    console.log('🔄 METI Sector filter changed:', Array.from(selectedSectors))

    // No sectors selected - show original scores
    if (selectedSectors.size === 0) {
      if (originalMetiScore !== null) {
        setMetiScore(prev => prev ? { ...prev, score: originalMetiScore } : null)
      }
      if (originalSentimentPulse !== null) {
        setSentimentPulse(originalSentimentPulse)
      }
      setNewsArticles(allNewsArticles)
      return
    }

    // Sector mapping - map sector names to news topics
    const sectorMapping: Record<string, string[]> = {
      'Energy & Renewable Energy': ['Energy', 'Oil & Gas', 'Renewable Energy', 'Power'],
      'Technology & Fintech': ['Technology', 'Fintech', 'Digital Economy', 'Telecom', 'ICT', 'Innovation'],
      'Infrastructure & Real Estate': ['Infrastructure', 'Real Estate', 'Construction', 'Transport', 'Transportation'],
      'Agriculture & Agribusiness': ['Agriculture', 'Agribusiness', 'Food Security', 'Farming'],
      'Manufacturing & Industrialization': ['Manufacturing', 'Industrial', 'Production', 'Industry'],
      'Tourism & Hospitality': ['Tourism', 'Hospitality', 'Travel', 'Culture'],
      'Financial Markets & Investment': ['Finance', 'Banking', 'Investment', 'Capital Markets', 'Economics', 'Economy'],
      'Healthcare & Pharmaceuticals': ['Healthcare', 'Health', 'Pharmaceutical', 'Medical']
    }

    // Filter news by selected sectors
    let sectorFilteredNews: NewsArticle[] = []
    let totalSectorScore = 0
    let sectorCount = 0

    selectedSectors.forEach(sector => {
      const sectorValues = sectorMapping[sector] || []

      const sectorNews = allNewsArticles.filter((news: any) => {
        const topics = news.topics || []
        return sectorValues.some(val =>
          topics.some((topic: string) =>
            topic.toLowerCase().includes(val.toLowerCase()) ||
            val.toLowerCase().includes(topic.toLowerCase())
          )
        )
      })

      sectorFilteredNews = [...sectorFilteredNews, ...sectorNews]

      if (sectorNews.length > 0) {
        // Calculate score: 50% news volume + 50% sentiment
        const volumeScore = Math.min(sectorNews.length * 10, 100)
        const sentimentScores = sectorNews
          .map((news: any) => news.sentiment_score || 50)
          .filter((score: number) => score > 0)

        const avgSentiment = sentimentScores.length > 0
          ? sentimentScores.reduce((sum: number, s: number) => sum + s, 0) / sentimentScores.length
          : 50

        const sectorScore = (volumeScore * 0.5) + (avgSentiment * 0.5)
        totalSectorScore += sectorScore
        sectorCount++

        console.log(`📰 METI ${sector}: ${sectorNews.length} articles, sentiment ${avgSentiment.toFixed(1)} → score ${sectorScore.toFixed(1)}`)
      }
    })

    // Remove duplicates from filtered news
    sectorFilteredNews = Array.from(new Set(sectorFilteredNews.map(n => n.id)))
      .map(id => sectorFilteredNews.find(n => n.id === id)!)

    // Update news articles to show only sector-related news
    setNewsArticles(sectorFilteredNews)

    // Calculate weighted METI score
    if (sectorCount > 0 && originalMetiScore !== null) {
      const avgSectorScore = totalSectorScore / sectorCount
      const weightedScore = (originalMetiScore * 0.5) + (avgSectorScore * 0.5)
      console.log(`✨ METI Score: Original ${originalMetiScore.toFixed(1)} → Weighted ${weightedScore.toFixed(1)}`)
      setMetiScore(prev => prev ? { ...prev, score: weightedScore } : null)

      // Update sentiment pulse based on filtered news
      if (sectorFilteredNews.length > 0) {
        const posCount = sectorFilteredNews.filter(n => n.sentiment_label?.toLowerCase() === 'positive').length
        const negCount = sectorFilteredNews.filter(n => n.sentiment_label?.toLowerCase() === 'negative').length
        const neutralCount = sectorFilteredNews.filter(n => n.sentiment_label?.toLowerCase() === 'neutral').length

        setSentimentPulse({
          positive_count: posCount,
          negative_count: negCount,
          neutral_count: neutralCount,
          trend: posCount > negCount ? 'Upward' : posCount < negCount ? 'Downward' : 'Stable'
        })
      }
    }
  }, [selectedSectors, selectedCountry, originalMetiScore, originalSentimentPulse, allNewsArticles])

  const loadCountries = async () => {
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

        // Fall back to first country if no preference or preference not found
        if (!countryToSelect && response.data.data.length > 0) {
          countryToSelect = response.data.data[0]
        }

        if (countryToSelect) {
          setSelectedCountry(countryToSelect)
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSectorData = async () => {
    try {
      setSectorLoading(true)
      const response = await marketsApi.getLatestSectors()

      if (response.data.success && response.data.data) {
        const sectors = response.data.data.map((sector: any) => {
          // Parse change_percent from the formatted string (e.g., "+1.23%" or "-0.45%")
          const changeStr = sector.change || '0%'
          const changePercent = parseFloat(changeStr.replace('%', '').replace('+', ''))

          // Determine outlook based on change_percent
          // Adjusted thresholds for realistic stock market movements
          let outlook = 'Neutral'
          if (changePercent > 0.5) {
            outlook = 'Favorable'
          } else if (changePercent < -0.5) {
            outlook = 'High-Risk'
          }

          return {
            name: sector.name, // API returns 'name' not 'sector_name'
            outlook,
            focusMarkets: getFocusMarkets(sector.name),
            value: parseFloat(sector.value) || 0,
            change_percent: changePercent
          }
        })

        setSectorData(sectors)
      }
    } catch (error) {
      console.error('Error loading sector data:', error)
      // Set fallback data on error
      setSectorData([
        { name: 'Energy & Renewable Energy', outlook: 'Favorable', focusMarkets: 'Solar, Hydro' },
        { name: 'Agriculture & Agribusiness', outlook: 'Favorable', focusMarkets: 'Cocoa, Tea' },
        { name: 'Technology & Fintech', outlook: 'Favorable', focusMarkets: 'Mobile Payments' },
        { name: 'Infrastructure & Real Estate', outlook: 'High-Risk', focusMarkets: 'Urban Housing' },
        { name: 'Manufacturing & Industrialization', outlook: 'Neutral', focusMarkets: 'Textiles, Packaging' },
        { name: 'Tourism & Hospitality', outlook: 'High-Risk', focusMarkets: 'Safari, Wellness' },
        { name: 'Financial Markets & Investment', outlook: 'Neutral', focusMarkets: 'Microfinance, PE' },
      ])
    } finally {
      setSectorLoading(false)
    }
  }

  const getFocusMarkets = (sectorName: string): string => {
    const focusMarketsMap: { [key: string]: string } = {
      'Energy & Renewable Energy': 'Solar, Hydro',
      'Agriculture & Agribusiness': 'Cocoa, Tea',
      'Technology & Fintech': 'Mobile Payments',
      'Infrastructure & Real Estate': 'Urban Housing',
      'Manufacturing & Industrialization': 'Textiles, Packaging',
      'Tourism & Hospitality': 'Safari, Wellness',
      'Financial Markets & Investment': 'Microfinance, PE',
    }
    return focusMarketsMap[sectorName] || 'Various'
  }

  const loadMETIScore = async () => {
    if (!selectedCountry) return

    try {
      setMetiLoading(true)
      const response = await metiApi.getScoresByCountry(selectedCountry.id)

      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const latestScore = response.data.data[0]
        setMetiScore({
          score: latestScore.score,
          year: latestScore.year,
          entryRecommendation: latestScore.entryRecommendation,
          confidenceLevel: latestScore.confidenceLevel,
          trendScore: latestScore.trendScore,
          volatilityScore: latestScore.volatilityScore,
          momentumScore: latestScore.momentumScore
        })
        // Store original score for sector filtering
        if (originalMetiScore === null) {
          setOriginalMetiScore(latestScore.score)
        }
      }
    } catch (error) {
      console.error('Error loading METI score:', error)
      setMetiScore(null)
    } finally {
      setMetiLoading(false)
    }
  }

  const loadSentimentData = async () => {
    if (!selectedCountry) return

    try {
      setSentimentLoading(true)
      const response = await sentimentApi.getNews(selectedCountry.id, 30)

      if (response.data.success && response.data.data) {
        setNewsArticles(response.data.data)
        // Store all news for sector filtering
        if (allNewsArticles.length === 0) {
          setAllNewsArticles(response.data.data)
        }
      }
    } catch (error) {
      console.error('Error loading sentiment data:', error)
      setNewsArticles([])
    } finally {
      setSentimentLoading(false)
    }
  }

  const loadSentimentPulse = async () => {
    if (!selectedCountry) return

    try {
      setPulseLoading(true)
      const response = await sentimentApi.getPulse(selectedCountry.id)

      if (response.data.success && response.data.data) {
        setSentimentPulse(response.data.data)
        // Store original pulse for sector filtering
        if (originalSentimentPulse === null) {
          setOriginalSentimentPulse(response.data.data)
        }
      }
    } catch (error) {
      console.error('Error loading sentiment pulse:', error)
      setSentimentPulse(null)
    } finally {
      setPulseLoading(false)
    }
  }

  const loadAlerts = async () => {
    if (!selectedCountry) return

    try {
      setAlertsLoading(true)
      const response = await sentimentApi.getAlerts(selectedCountry.id)

      if (response.data.success && response.data.data) {
        setAlerts(response.data.data)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
      setAlerts([])
    } finally {
      setAlertsLoading(false)
    }
  }

  const loadAIBrief = async () => {
    if (!selectedCountry) return

    try {
      setAiBriefLoading(true)
      const brief = await generateInvestmentBrief(selectedCountry.name, 'METI')
      if (brief) {
        setAiBrief(brief)
      }
    } catch (error) {
      console.error('Error loading AI brief:', error)
      setAiBrief(null)
    } finally {
      setAiBriefLoading(false)
    }
  }

  const loadHistoricalMETIData = async () => {
    if (!selectedCountry) return

    try {
      setHistoricalLoading(true)
      const years = [2019, 2020, 2021, 2022, 2023]

      const allData: HistoricalMETIData[] = []

      // Fetch data for each year
      for (const year of years) {
        try {
          const response = await metiApi.getScores(year)
          if (response.data.success && response.data.data) {
            const countryScore = response.data.data.find(
              (score: any) => score.countryId === selectedCountry.id
            )
            if (countryScore) {
              allData.push({
                year,
                score: countryScore.score,
                countryId: selectedCountry.id
              })
            }
          }
        } catch (error) {
          console.error(`Error loading METI score for ${year}:`, error)
        }
      }

      setHistoricalData(allData.sort((a, b) => a.year - b.year))
    } catch (error) {
      console.error('Error loading historical METI data:', error)
      setHistoricalData([])
    } finally {
      setHistoricalLoading(false)
    }
  }

  // Get filtered historical data based on selected year range
  const getFilteredHistoricalData = () => {
    if (historicalData.length === 0) return []
    const latestYear = Math.max(...historicalData.map(d => d.year))
    const startYear = latestYear - selectedYearRange + 1
    return historicalData.filter(d => d.year >= startYear)
  }

  // Helper function to get country flag
  const getCountryFlag = (countryName: string) => {
    const flagMap: { [key: string]: string } = {
      'Nigeria': '/assets/nigeria.svg',
      'Ghana': '/assets/ghana.svg',
      'Kenya': '/assets/kenya.svg',
      'South Africa': '/assets/south-africa.svg',
      'Egypt': '/assets/egypt.svg',
      'Morocco': '/assets/morocco.svg',
      'Ethiopia': '/assets/ethiopia.svg',
      'Tanzania': '/assets/tanzania.svg',
      'Botswana': '/assets/botswana.svg',
      'Rwanda': '/assets/rwanda.svg',
      'Tunisia': '/assets/tunisia.svg',
      'Mauritius': '/assets/mauritius.svg',
    }
    return flagMap[countryName] || null
  }

  // Calculate sentiment distribution from news articles
  const calculateSentimentMix = () => {
    if (newsArticles.length === 0) {
      return { positive: 40, neutral: 25, negative: 35 }
    }

    const positive = newsArticles.filter(a => a.sentiment_label === 'positive').length
    const negative = newsArticles.filter(a => a.sentiment_label === 'negative').length
    const neutral = newsArticles.filter(a => a.sentiment_label === 'neutral').length
    const total = newsArticles.length

    return {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    }
  }

  // Get dominant sentiment for Zawadi Signal card
  const getDominantSentiment = () => {
    const sentimentMix = calculateSentimentMix()
    const max = Math.max(sentimentMix.positive, sentimentMix.neutral, sentimentMix.negative)

    if (sentimentMix.positive === max) {
      return { label: 'Strong Entry', badge: 'bg-green-100 text-green-800', signal: 'Bullish' }
    } else if (sentimentMix.neutral === max) {
      return { label: 'Neutral', badge: 'bg-yellow-100 text-yellow-800', signal: 'Neutral' }
    } else {
      return { label: 'Caution', badge: 'bg-red-100 text-red-800', signal: 'Bearish' }
    }
  }

  // Get sentiment pulse display data
  const getSentimentPulseDisplay = () => {
    if (!sentimentPulse) {
      return {
        label: 'Positive',
        color: 'text-green-600',
        trend: 'Upward',
        icon: '📈'
      }
    }

    const sentiment = sentimentPulse.overall_sentiment || 0

    if (sentiment > 20) {
      return {
        label: 'Positive',
        color: 'text-green-600',
        trend: 'Upward',
        icon: '📈'
      }
    } else if (sentiment < -20) {
      return {
        label: 'Negative',
        color: 'text-red-600',
        trend: 'Downward',
        icon: '📉'
      }
    } else {
      return {
        label: 'Neutral',
        color: 'text-yellow-600',
        trend: 'Stable',
        icon: '📊'
      }
    }
  }

  // Generate alerts from news articles and METI score
  const generateAlertsFromNews = () => {
    if (newsArticles.length === 0) {
      return []
    }

    const generatedAlerts = []
    const sentimentMix = calculateSentimentMix()

    // Alert if negative sentiment is high (>50%)
    if (sentimentMix.negative > 50) {
      generatedAlerts.push({
        severity: 'critical',
        message: `High negative sentiment detected: ${sentimentMix.negative}% of recent news is negative`
      })
    }

    // Alert if negative sentiment is moderate (40-50%)
    if (sentimentMix.negative >= 40 && sentimentMix.negative <= 50) {
      generatedAlerts.push({
        severity: 'warning',
        message: `Elevated negative sentiment: ${sentimentMix.negative}% of recent news is negative`
      })
    }

    // Alert if positive sentiment dropped significantly (< 30%)
    if (sentimentMix.positive < 30) {
      generatedAlerts.push({
        severity: 'warning',
        message: `Low positive sentiment: Only ${sentimentMix.positive}% of recent news is positive`
      })
    }

    // Alert if METI score is below 50
    if (metiScore && metiScore.score < 50) {
      generatedAlerts.push({
        severity: 'critical',
        message: `METI score below 50: Current score is ${metiScore.score.toFixed(0)}`
      })
    }

    return generatedAlerts
  }

  // Get alerts summary
  const getAlertsSummary = () => {
    const allAlerts = alerts.length > 0 ? alerts : generateAlertsFromNews()

    if (allAlerts.length === 0) {
      return {
        critical: 0,
        total: 0,
        message: 'All systems operating normally'
      }
    }

    const critical = allAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length

    return {
      critical,
      total: allAlerts.length,
      message: allAlerts[0]?.description || allAlerts[0]?.message || 'Recent alert detected'
    }
  }

  // METI helpers
  const getMETIStatus = (score: number) => {
    if (score >= 70) return 'Strong Bullish'
    if (score >= 60) return 'Bullish'
    if (score >= 50) return 'Neutral'
    if (score >= 40) return 'Bearish'
    return 'Strong Bearish'
  }

  const getMETIColor = (score: number) => {
    if (score >= 60) return '#10b981' // green
    if (score >= 40) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getMETITextColor = (score: number) => {
    if (score >= 60) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Get display values
  const displayScore = metiScore?.score ?? 72
  const dominantSentiment = getDominantSentiment()
  const sentimentPulseDisplay = getSentimentPulseDisplay()
  const alertsSummary = getAlertsSummary()

  const driverCategories: DriverCategoryData[] = [
    { name: 'Macroeconomic Stability', contribution: '+7.5', riskLevel: 'Critical' },
    { name: 'Liquidity & Capital Flow', contribution: '+12.0', riskLevel: 'Moderate' },
    { name: 'Yield Curve & Credit Spread', contribution: '+14.0', riskLevel: 'Moderate' },
    { name: 'Market Volatility & Risk Appetite', contribution: '+16.5', riskLevel: 'Strong' },
    { name: 'Sentiment Pulse (% Positive)', contribution: '+8.0', riskLevel: 'Moderate' },
  ]

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'Favorable': return 'text-green-600'
      case 'High-Risk': return 'text-red-600'
      case 'Neutral': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskLevelDot = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-500'
      case 'Moderate': return 'bg-yellow-500'
      case 'Strong': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (!selectedCountry) {
    return null
  }

  return (
    <div className="bg-white text-black p-6">
      {/* Country Selector and Date */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 pointer-events-none z-10">
              {getCountryFlag(selectedCountry.name) ? (
                <img
                  src={getCountryFlag(selectedCountry.name)!}
                  alt={selectedCountry.name}
                  width="32"
                  height="32"
                  style={{ width: '32px', height: '32px', objectFit: 'cover', display: 'block' }}
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
              className="bg-white text-gray-900 pl-14 pr-10 py-2 rounded-lg border border-gray-300 outline-none  shadow-sm appearance-none cursor-pointer"
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
        </div>
        <div className="relative calendar-container">
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
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 w-80">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() - 1)
                    setSelectedDate(newDate)
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-base font-semibold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate)
                    newDate.setMonth(newDate.getMonth() + 1)
                    setSelectedDate(newDate)
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
                  const year = selectedDate.getFullYear()
                  const month = selectedDate.getMonth()
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
                    setSelectedDate(new Date())
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
        </div>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {/* METI Score */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-800">METI Score</h3>
          </div>
          <div className="p-4">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                  <div className="text-[24px] font-bold text-black mb-1">
                    Entry timing
                  </div>
                  <div className="text-sm text-gray-600">{getMETIStatus(displayScore)}</div>
                </div>

                {/* Circular Progress */}
                <div className="flex justify-center xl:justify-end">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={getMETIColor(displayScore)}
                        strokeWidth="2"
                        strokeDasharray={`${displayScore}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${getMETITextColor(displayScore)}`}>
                        {displayScore.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Zawadi Signal */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-800">Zawadi Signal</h3>
          </div>
          <div className="p-4">
            <>
              <div className="text-[24px] font-semibold text-black mb-1">{dominantSentiment.label}</div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Based on multi-signal strength</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${dominantSentiment.badge}`}>
                  {dominantSentiment.signal}
                </div>
              </div>
            </>
          </div>
        </div>

        {/* Sentiment Pulse */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-800">Sentiment Pulse</h3>
          </div>
          <div className="p-4">
            <>
              <div className="flex items-start justify-between ">
                <div className={`text-[24px] font-semibold`}>
                  {sentimentPulseDisplay.label}
                </div>
                <div className="text-sm text-black flex items-center gap-1 flex-shrink-0 ml-2">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {sentimentPulseDisplay.trend === 'Upward' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    ) : sentimentPulseDisplay.trend === 'Downward' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    )}
                  </svg>
                  <span className="whitespace-nowrap">{sentimentPulseDisplay.trend}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-black">Based on last 30 days</div>
                <div className="flex-shrink-0 max-w-[100px]">
                  <img
                    src={
                      sentimentPulseDisplay.trend === 'Upward'
                        ? '/assets/upward.svg'
                        : sentimentPulseDisplay.trend === 'Downward'
                        ? '/assets/downward.svg'
                        : '/assets/neutral.svg'
                    }
                    alt={`${sentimentPulseDisplay.trend} trend`}
                    className="h-8 w-auto max-w-full"
                  />
                </div>
              </div>
            </>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-800">Alerts</h3>
          </div>
          <div className="p-4">
            <>
              <div className="flex items-center space-x-2 mb-2">
                {alertsSummary.critical > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
                <span className="text-[24px] font-semibold text-black">
                  {alertsSummary.critical > 0
                    ? `${alertsSummary.critical} Critical / ${alertsSummary.total} New`
                    : alertsSummary.total > 0
                    ? `${alertsSummary.total} New`
                    : 'No alerts'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {alertsSummary.message}
              </div>
            </>
          </div>
        </div>
      </div>

      {/* Main Content - Flexible Layout */}
      <div className="flex gap-6">
        {/* Left Side - Chart and Sectors */}
        <div className="flex-[0.65] space-y-6">
          {/* Chart Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              {/* Year Range Selector */}
              <div className="inline-flex space-x-2">
                {[
                  { label: '2Y', value: 2 },
                  { label: '3Y', value: 3 },
                  { label: '4Y', value: 4 },
                  { label: '5Y', value: 5 }
                ].map((period) => (
                  <button
                    key={period.label}
                    onClick={() => setSelectedYearRange(period.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      selectedYearRange === period.value ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              <>
                {/* Chart Legend */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
                    <span className="text-sm text-gray-700">METI Score - {selectedCountry?.name}</span>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="h-80 bg-gray-50 rounded relative p-8">
                    {(() => {
                      const filteredData = getFilteredHistoricalData()
                      if (filteredData.length === 0) {
                        return (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-gray-500">No historical data available</span>
                          </div>
                        )
                      }

                      return (
                        <>
                          {/* Y-axis labels */}
                          <div className="absolute left-2 top-8 bottom-12 flex flex-col justify-between text-xs text-gray-500">
                            <span>100</span>
                            <span>75</span>
                            <span>50</span>
                            <span>25</span>
                            <span>0</span>
                          </div>

                          {/* X-axis labels */}
                          <div className="absolute bottom-2 left-12 right-8 flex justify-between text-xs text-gray-500">
                            {filteredData.map((point) => (
                              <span key={point.year}>{point.year}</span>
                            ))}
                          </div>

                          {/* Chart SVG */}
                          <svg className="absolute left-12 top-8 right-8 bottom-12" style={{ width: 'calc(100% - 5rem)', height: 'calc(100% - 5rem)' }}>
                            <defs>
                              <clipPath id="meti-chart-clip">
                                <rect x="0" y="0" width="100%" height="100%" />
                              </clipPath>
                            </defs>

                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map((value) => (
                              <line
                                key={value}
                                x1="0%"
                                y1={`${100 - value}%`}
                                x2="100%"
                                y2={`${100 - value}%`}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                              />
                            ))}

                            <g clipPath="url(#meti-chart-clip)">
                              {/* Line connecting points */}
                              {filteredData.length > 1 && filteredData.map((point, index) => {
                                if (index === filteredData.length - 1) return null
                                const padding = 3
                                const totalPoints = filteredData.length
                                const x1Percent = padding + (index / (totalPoints - 1)) * (100 - 2 * padding)
                                const y1Percent = 100 - point.score
                                const x2Percent = padding + ((index + 1) / (totalPoints - 1)) * (100 - 2 * padding)
                                const y2Percent = 100 - filteredData[index + 1].score
                                return (
                                  <line
                                    key={`line-${point.year}`}
                                    x1={`${x1Percent}%`}
                                    y1={`${y1Percent}%`}
                                    x2={`${x2Percent}%`}
                                    y2={`${y2Percent}%`}
                                    stroke="#a855f7"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                )
                              })}

                              {/* Data points with hover */}
                              {filteredData.map((point, index) => {
                                const padding = 3
                                const totalPoints = filteredData.length
                                const xPercent = totalPoints === 1 ? 50 : padding + (index / (totalPoints - 1)) * (100 - 2 * padding)
                                const yPercent = 100 - point.score
                                return (
                                  <g
                                    key={point.year}
                                    onMouseEnter={() => {
                                      if (hoverTimeout) clearTimeout(hoverTimeout)
                                      setHoveredPoint(point)
                                    }}
                                    onMouseLeave={() => {
                                      const timeout = setTimeout(() => setHoveredPoint(null), 100)
                                      setHoverTimeout(timeout)
                                    }}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {/* Invisible larger circle for easier hovering */}
                                    <circle
                                      cx={`${xPercent}%`}
                                      cy={`${yPercent}%`}
                                      r="15"
                                      fill="transparent"
                                    />
                                    {/* Visible data point */}
                                    <circle
                                      cx={`${xPercent}%`}
                                      cy={`${yPercent}%`}
                                      r="5"
                                      fill="#a855f7"
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                  </g>
                                )
                              })}
                            </g>
                          </svg>

                          {/* Hover tooltip */}
                          {hoveredPoint && (
                            <div className="absolute top-4 right-4 bg-white border rounded-lg p-4 text-sm shadow-lg z-10 w-[262px] pointer-events-none">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                                  <span className="font-semibold text-black">{selectedCountry?.name}</span>
                                </div>
                                <span className="text-gray-500">{hoveredPoint.year}</span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">METI Score</span>
                                <strong className="text-black">{hoveredPoint.score.toFixed(2)}</strong>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-600">Status</span>
                                <span className="text-sm text-gray-800">
                                  {getMETIStatus(hoveredPoint.score)}
                                </span>
                              </div>
                              {(() => {
                                const currentIndex = filteredData.findIndex(d => d.year === hoveredPoint.year)
                                if (currentIndex > 0) {
                                  const previousScore = filteredData[currentIndex - 1].score
                                  const change = hoveredPoint.score - previousScore
                                  return (
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-600">Change</span>
                                      <span className={change >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                      </span>
                                    </div>
                                  )
                                }
                                return null
                              })()}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </>
            </div>
          </div>

          {/* Sectors Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 ">
              <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
                <span className="text-left">Sector</span>
                <span className="text-center">Zawadi AI Outlook</span>
                <span className="text-center">Focus Markets</span>
              </div>
            </div>
            <div>
              {sectorData.map((sector, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-3 gap-4 items-center px-4 py-3 cursor-pointer hover:opacity-90 transition-opacity ${
                    sector.outlook === 'Favorable' ? 'bg-[#ECFEF4]' :
                    sector.outlook === 'High-Risk' ? 'bg-[#FFEBE8]' :
                    sector.outlook === 'Neutral' ? 'bg-[#FDF5E2]' :
                    'bg-white'
                  } ${index !== sectorData.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded cursor-pointer accent-[#9514EB] flex-shrink-0"
                      checked={selectedSectors.has(sector.name)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedSectors)
                        if (e.target.checked) {
                          newSelected.add(sector.name)
                        } else {
                          newSelected.delete(sector.name)
                        }
                        setSelectedSectors(newSelected)
                      }}
                    />
                    <span className="text-sm text-black">{sector.name}</span>
                  </div>
                  <span className={`text-sm ${getOutlookColor(sector.outlook)} text-center`}>
                    {sector.outlook}
                  </span>
                  <span className="text-sm text-gray-600 text-center">{sector.focusMarkets}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Driver Categories and Investment Briefs */}
        <div className="flex-[0.35] flex flex-col gap-6">
          {/* Driver Categories */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                <h3 className="text-sm font-semibold text-black text-center">Driver Category</h3>
                <span className="text-sm font-semibold text-center min-w-[80px]">Contribution</span>
                <span className="text-sm font-semibold text-center min-w-[100px]">Risk Level</span>
              </div>
            </div>
            <div className="p-4">
              {driverCategories.map((category, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[1fr_auto_auto] gap-3 items-center py-3 ${
                    index !== driverCategories.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <span className="text-sm text-black leading-tight text-center">{category.name}</span>
                  <span className="text-sm text-black text-center min-w-[60px]">{category.contribution}</span>
                  <div className="flex items-center justify-center space-x-2 min-w-[100px]">
                    <div className={`w-2 h-2 rounded-full ${getRiskLevelDot(category.riskLevel)}`}></div>
                    <span className="text-sm text-gray-600">{category.riskLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Briefs - Fixed height with scrolling */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-[440px] flex flex-col">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-black">Investment Briefs (AI Generated)</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {aiBrief ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-black">{selectedCountry?.name}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${aiBrief.confidence === 'High Confidence' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {aiBrief.confidence}
                        </span>
                        <span className="text-xs text-gray-500">{aiBrief.updatedAt}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-black mb-2 flex items-center">
                          <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                          Setup
                        </h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {aiBrief.setup}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-medium text-black mb-2 flex items-center">
                          <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                          Positioning
                        </h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {aiBrief.positioning}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      Generated by Zawadi AI using real-time METI data and market entry timing indicators.
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Unable to generate investment brief.</p>
                    <p className="text-xs mt-2">Please check your authentication and try again.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

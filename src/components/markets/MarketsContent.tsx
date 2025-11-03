'use client'

import { useState, useEffect } from 'react'
import { marketsApi, countriesApi, sentimentApi, currencyApi } from '@/lib/api'
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
  topics: string[]
  url: string
}

interface EquityFactor {
  name: string
  value: string
  core: string
  growth: string
}

interface SectorETF {
  name: string
  value: string
  forecast: string
  change: string
}

interface MarketKPI {
  code: string
  name: string
  unit: string
  value: number
  normalizedValue: number
  year: number
}

interface MarketsContentProps {
  onContentReady?: () => void
}

export default function MarketsContent({ onContentReady }: MarketsContentProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [equityFactorsData, setEquityFactorsData] = useState<EquityFactor[]>([
    { name: 'Large', value: '-0.1%', core: '-0.3%', growth: '-0.4%' },
    { name: 'Mid', value: '-0.3%', core: '-0.4%', growth: '-0.5%' },
    { name: 'Small', value: '-0.4%', core: '-0.4%', growth: '-0.3%' },
  ])
  const [sectorETFsData, setSectorETFsData] = useState<SectorETF[]>([
    { name: 'Energy & Renewable Energy', value: '$114.9B', forecast: '$118.3B', change: '+1.21%' },
    { name: 'Technology & Fintech', value: '$2,150', forecast: '$2,310', change: '+1.21%' },
    { name: 'Infrastructure & Real Estate', value: '5.1%', forecast: '5.6%', change: '+1.21%' },
    { name: 'Manufacturing & Industrialization', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Agriculture & Agribusiness', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Tourism & Hospitality', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Financial Markets & Investment', value: '7.8%', forecast: '6.4%', change: '-2.31%' },
  ])

  // API data states
  const [macroeconomicData, setMacroeconomicData] = useState<MarketKPI[]>([])
  const [financeData, setFinanceData] = useState<MarketKPI[]>([])
  const [governanceData, setGovernanceData] = useState<MarketKPI[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [currencyRates, setCurrencyRates] = useState<any[]>([])
  const [currencyLoading, setCurrencyLoading] = useState(true)

  // Historical chart data
  const [historicalMacroData, setHistoricalMacroData] = useState<{[year: number]: MarketKPI[]}>({})
  const [historicalLoading, setHistoricalLoading] = useState(false)
  const [selectedYearRange, setSelectedYearRange] = useState(5)
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Load countries on mount
  useEffect(() => {
    loadCountries()
  }, [])

  // Notify parent once initial data has loaded (including chart data)
  useEffect(() => {
    if (selectedCountry && !dataLoading && !historicalLoading && onContentReady) {
      onContentReady()
    }
  }, [selectedCountry, dataLoading, historicalLoading, onContentReady])

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

  // Load market data when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadMarketData()
      loadHistoricalMacroData()
      loadNewsData()
      loadCurrencyData()
    }
  }, [selectedCountry])

  const loadCountries = async () => {
    try {
      setLoading(true)
      const response = await countriesApi.getAfricanCountries()
      if (response.data.success && response.data.data && response.data.data.length > 0) {
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

  const loadMarketData = async () => {
    if (!selectedCountry) return

    try {
      setDataLoading(true)

      // Load macroeconomic data (using 2021 - most recent year with complete data)
      const macroResponse = await marketsApi.getMacroeconomic(selectedCountry.id, 2021)
      if (macroResponse.data.success && macroResponse.data.data) {
        setMacroeconomicData(macroResponse.data.data)
      }

      // Load finance (investment & capital) data
      const financeResponse = await marketsApi.getInvestmentCapital(selectedCountry.id, 2021)
      if (financeResponse.data.success && financeResponse.data.data) {
        setFinanceData(financeResponse.data.data)
      }

      // Load governance & risk data
      const governanceResponse = await marketsApi.getPoliticalEconomicRisk(selectedCountry.id, 2021)
      if (governanceResponse.data.success && governanceResponse.data.data) {
        setGovernanceData(governanceResponse.data.data)
      }

      setDataLoading(false)
    } catch (error) {
      console.error('Error loading market data:', error)
      setDataLoading(false)
    }
  }

  const loadHistoricalMacroData = async () => {
    if (!selectedCountry) return

    try {
      setHistoricalLoading(true)
      const years = [2019, 2020, 2021, 2022, 2023]
      const historicalData: {[year: number]: MarketKPI[]} = {}

      for (const year of years) {
        try {
          const response = await marketsApi.getMacroeconomic(selectedCountry.id, year)
          if (response.data.success && response.data.data) {
            historicalData[year] = response.data.data
          }
        } catch (error) {
          console.error(`Error loading macroeconomic data for ${year}:`, error)
        }
      }

      setHistoricalMacroData(historicalData)
      setHistoricalLoading(false)
    } catch (error) {
      console.error('Error loading historical macro data:', error)
      setHistoricalLoading(false)
    }
  }

  const loadNewsData = async () => {
    if (!selectedCountry) return

    try {
      setNewsLoading(true)
      const response = await sentimentApi.getNews(selectedCountry.id, 7, 10)
      if (response.data.success && response.data.data) {
        setNewsArticles(response.data.data)
      }
    } catch (error) {
      console.error('Error loading news data:', error)
      setNewsArticles([])
    } finally {
      setNewsLoading(false)
    }
  }

  const loadCurrencyData = async () => {
    if (!selectedCountry) return

    try {
      setCurrencyLoading(true)
      const response = await currencyApi.getRates(selectedCountry.name)
      if (response.data.success && response.data.data?.pairs) {
        setCurrencyRates(response.data.data.pairs)
      }
    } catch (error) {
      console.error('Error loading currency data:', error)
      setCurrencyRates([])
    } finally {
      setCurrencyLoading(false)
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return '<1h ago'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  // Fetch equity factors from API
  useEffect(() => {
    const loadEquityFactors = async () => {
      try {
        const response = await marketsApi.getEquityFactorPerformance()
        if (response.data.success && response.data.data) {
          setEquityFactorsData(response.data.data)
        }
      } catch (error) {
        console.error('Error loading equity factors:', error)
        // Keep default hardcoded data on error
      }
    }
    loadEquityFactors()
  }, [])

  // Fetch sector ETFs from API
  useEffect(() => {
    const loadSectorETFs = async () => {
      try {
        const response = await marketsApi.getLatestSectors()
        if (response.data.success && response.data.data) {
          setSectorETFsData(response.data.data)
        }
      } catch (error) {
        console.error('Error loading sector ETFs:', error)
        // Keep default hardcoded data on error
      }
    }
    loadSectorETFs()
  }, [])

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-500'
    if (change.startsWith('-')) return 'text-red-500'
    return 'text-gray-400'
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
    return flagMap[countryName]
  }

  // Get filtered years based on selected range
  const getFilteredYears = () => {
    const allYears = Object.keys(historicalMacroData).map(Number).sort()
    if (allYears.length === 0) return []
    const latestYear = Math.max(...allYears)
    const startYear = latestYear - selectedYearRange + 1
    return allYears.filter(y => y >= startYear)
  }

  // Get KPI colors
  const getKPIColor = (kpiCode: string) => {
    const colorMap: {[key: string]: string} = {
      'GDP_GROWTH': '#a855f7',
      'INFLATION_RATE': '#3b82f6',
      'EXCHANGE_RATE_VOLATILITY': '#f97316',
      'FDI_INFLOWS': '#06b6d4',
      'DEBT_TO_GDP': '#ec4899',
      'TAX_BURDEN': '#10b981',
      'TRADE_BALANCE': '#f59e0b'
    }
    return colorMap[kpiCode] || '#6b7280'
  }

  // Get all unique KPIs from historical data
  const getAllKPIs = () => {
    const kpiMap = new Map<string, MarketKPI>()
    Object.values(historicalMacroData).forEach(yearData => {
      yearData.forEach(kpi => {
        if (!kpiMap.has(kpi.code)) {
          kpiMap.set(kpi.code, kpi)
        }
      })
    })
    return Array.from(kpiMap.values())
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
              className="bg-white text-gray-900 pl-14 pr-10 py-2 rounded-lg border border-gray-300 outline-none shadow-sm appearance-none cursor-pointer"
            >
              {countries.map(country => (
                <option key={country.id} value={country.id}>{country.name}</option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
            >
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

      {/* Top Row - Macroeconomic, Currencies, Finance */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Macroeconomic Overview */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Macroeconomic Overview</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs text-black font-semibold">
              <span>Metric</span>
              <span>Value</span>
              <span>Score</span>
            </div>
          </div>
          <div className="p-4 h-full">
            {macroeconomicData.length > 0 ? (
              macroeconomicData.map((kpi, index) => (
                <div key={kpi.code} className={`grid grid-cols-3 gap-4 items-center py-2 text-gray-700 ${index !== macroeconomicData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm truncate" title={kpi.name}>{kpi.name}</span>
                  <span className="text-sm  truncate" title={kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}>
                    {kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}
                  </span>
                  <span className="text-sm ">
                    {kpi.normalizedValue ? kpi.normalizedValue.toFixed(1) : 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
          </div>
        </div>

        {/* Currencies */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Currencies</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs text-black font-semibold">
              <span>Pair</span>
              <span>Rate</span>
              <span>%</span>
            </div>
          </div>
          <div className="p-4 h-full">
            {currencyRates.length > 0 ? (
              <>
                {currencyRates.map((currency, index) => (
                  <div key={index} className={`grid grid-cols-3 gap-4 items-center py-2 ${index !== currencyRates.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-sm text-gray-700">{currency.pair}</span>
                    <span className="text-sm text-gray-700">{currency.rate}</span>
                    <span className={`text-sm ${
                      currency.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {currency.changeFormatted}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No currency data available</div>
            )}
          </div>
          </div>
        </div>

        {/* Finance */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Finance</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs text-black font-semibold">
              <span>External Finance</span>
              <span>Value</span>
              <span>Score</span>
            </div>
          </div>
          <div className="p-4 h-full">
            {financeData.length > 0 ? (
              financeData.map((kpi, index) => (
                <div key={kpi.code} className={`grid grid-cols-3 gap-4 items-center py-2 text-gray-700 ${index !== financeData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm truncate" title={kpi.name}>{kpi.name}</span>
                  <span className="text-sm truncate" title={kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}>
                    {kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}
                  </span>
                  <span className="text-sm ">
                    {kpi.normalizedValue ? kpi.normalizedValue.toFixed(1) : 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Second Row - Chart and Market News */}
      <div className="flex gap-6 mb-6">
        {/* Chart Component - Custom width */}
        <div className="flex flex-col" style={{ width: '67%' }}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Macroeconomic Overview</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
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

            {Object.keys(historicalMacroData).length > 0 && getFilteredYears().length > 0 ? (
              <>
                {/* Chart Legend */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getAllKPIs().map((kpi) => (
                    <div
                      key={kpi.code}
                      className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                    >
                      <div
                        className="w-1 h-full flex-shrink-0"
                        style={{ backgroundColor: getKPIColor(kpi.code) }}
                      ></div>
                      <span className="text-sm text-black whitespace-nowrap pl-2">{kpi.name}</span>
                      <button
                        className="pr-2 pl-1 py-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        onClick={() => {/* Add filter toggle logic */}}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="h-80 bg-gray-50 rounded relative p-8">
                  <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                    {(() => {
                      const filteredYears = getFilteredYears()
                      const allKPIs = getAllKPIs()
                      const width = 100
                      const height = 100
                      const padding = 10

                      return (
                        <>
                          {/* Grid lines */}
                          {[0, 25, 50, 75, 100].map((val) => {
                            const y = height - padding - ((val / 100) * (height - 2 * padding))
                            return (
                              <g key={val}>
                                <line
                                  x1={`${padding}%`}
                                  y1={`${y}%`}
                                  x2={`${width - padding}%`}
                                  y2={`${y}%`}
                                  stroke="#e5e7eb"
                                  strokeWidth="1"
                                />
                                <text
                                  x={`${padding - 2}%`}
                                  y={`${y}%`}
                                  textAnchor="end"
                                  dominantBaseline="middle"
                                  className="text-xs fill-gray-600"
                                >
                                  {val}
                                </text>
                              </g>
                            )
                          })}

                          {/* Draw lines and points for each KPI */}
                          {allKPIs.map((kpi) => {
                            const points: {x: number, y: number, year: number, value: number}[] = []
                            filteredYears.forEach((year, idx) => {
                              const yearData = historicalMacroData[year]
                              if (yearData) {
                                const kpiData = yearData.find(k => k.code === kpi.code)
                                if (kpiData && kpiData.normalizedValue != null) {
                                  const x = padding + (filteredYears.length > 1 ? (idx / (filteredYears.length - 1)) * (width - 2 * padding) : (width - 2 * padding) / 2)
                                  const y = height - padding - ((kpiData.normalizedValue / 100) * (height - 2 * padding))
                                  points.push({ x, y, year, value: kpiData.normalizedValue })
                                }
                              }
                            })

                            if (points.length === 0) return null

                            return (
                              <g key={kpi.code}>
                                {/* Lines connecting consecutive points */}
                                {points.map((point, index) => {
                                  if (index === points.length - 1) return null
                                  const nextPoint = points[index + 1]
                                  return (
                                    <line
                                      key={`${kpi.code}-line-${point.year}`}
                                      x1={`${point.x}%`}
                                      y1={`${point.y}%`}
                                      x2={`${nextPoint.x}%`}
                                      y2={`${nextPoint.y}%`}
                                      stroke={getKPIColor(kpi.code)}
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                    />
                                  )
                                })}
                                {/* Data points */}
                                {points.map((point) => (
                                  <circle
                                    key={`${kpi.code}-${point.year}`}
                                    cx={`${point.x}%`}
                                    cy={`${point.y}%`}
                                    r="5"
                                    fill={getKPIColor(kpi.code)}
                                    onMouseEnter={() => setHoveredYear(point.year)}
                                    onMouseLeave={() => setHoveredYear(null)}
                                    className="cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                  />
                                ))}
                              </g>
                            )
                          })}

                          {/* X-axis labels */}
                          {filteredYears.map((year, idx) => {
                            const x = padding + ((idx / (filteredYears.length - 1)) * (width - 2 * padding))
                            return (
                              <text
                                key={year}
                                x={`${x}%`}
                                y={`${height - padding + 5}%`}
                                textAnchor="middle"
                                className="text-xs fill-gray-600"
                              >
                                {year}
                              </text>
                            )
                          })}
                        </>
                      )
                    })()}
                  </svg>

                  {/* Hover tooltip */}
                  {hoveredYear && historicalMacroData[hoveredYear] && (
                    <div className="absolute top-4 right-4 bg-white border rounded p-3 text-xs shadow-lg z-10">
                      <div className="font-semibold mb-2">{hoveredYear}</div>
                      {historicalMacroData[hoveredYear].map((kpi) => (
                        <div key={kpi.code} className="flex items-center justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getKPIColor(kpi.code) }}></div>
                            <span>{kpi.name}:</span>
                          </div>
                          <strong>{kpi.normalizedValue ? kpi.normalizedValue.toFixed(1) : 'N/A'}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No historical data available
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Market News - Custom width */}
        <div className="flex flex-col" style={{ width: '33%' }}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Market News</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
          <div className="p-4">
            {newsArticles.length > 0 ? (
              <div className="space-y-4">
                {newsArticles.slice(0, 5).map((article) => (
                  <div key={article.id} className="pb-3 border-b border-gray-100 last:border-b-0">
                    <h4 className="text-sm font-medium mb-1 text-black">{article.title}</h4>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{article.source} {article.topics?.[0] ? `> ${article.topics[0]}` : ''}</span>
                      <span>{getRelativeTime(article.published_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No news available</div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6 mt-6">

        {/* Governance & Risk */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Governance & Risk</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-xs text-black font-semibold">
              <span>Indicator</span>
              <span>Value</span>
              <span>Score</span>
            </div>
          </div>
          <div className="p-4 h-full">
            {governanceData.length > 0 ? (
              governanceData.map((kpi, index) => (
                <div key={kpi.code} className={`grid grid-cols-3 gap-4 items-center py-2 text-gray-700 ${index !== governanceData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm  truncate" title={kpi.name}>{kpi.name}</span>
                  <span className="text-sm ">
                    {kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}
                  </span>
                  <span className="text-sm">
                    {kpi.normalizedValue ? kpi.normalizedValue.toFixed(1) : 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
          </div>
        </div>

        {/* Equity Factors */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Equity Factors</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="text-sm text-black font-semibold">1-Day Performance</div>
          </div>
          <div className="p-4 h-full">
          <div className="mb-4">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div></div>
              <div className="text-center text-xs text-gray-500 font-medium">Value</div>
              <div className="text-center text-xs text-gray-500 font-medium">Core</div>
              <div className="text-center text-xs text-gray-500 font-medium">Growth</div>
            </div>
            
            {/* Data Rows */}
            {equityFactorsData.map((factor: EquityFactor, index: number) => (
              <div key={index} className="grid grid-cols-4 gap-3 mb-6">
                <div className="flex items-center text-sm text-black font-">{factor.name}</div>

                {/* Value Box */}
                <div className="bg-red-100 border border-red-200 rounded-md py-6 px-2 text-center flex items-center justify-center">
                  <span className="text-xs font-medium text-red-800 break-words">{factor.value}</span>
                </div>

                {/* Core Box */}
                <div className={`${index === 1 ? 'bg-blue-100 border-blue-300 border-2' : 'bg-red-100 border border-red-200'} rounded-md py-6 px-2 text-center flex items-center justify-center`}>
                  <span className={`text-xs font-medium ${index === 1 ? 'text-blue-800' : 'text-red-800'} break-words`}>
                    {factor.core}
                  </span>
                </div>

                {/* Growth Box */}
                <div className="bg-red-100 border border-red-200 rounded-md py-6 px-2 text-center flex items-center justify-center">
                  <span className="text-xs font-medium text-red-800 break-words">{factor.growth}</span>
                </div>
              </div>
            ))}
            </div>
          </div>
          </div>
        </div>

        {/* Equity Sectors */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Equity Sectors</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-xs text-black font-semibold">
              <span>S&P Sector ETFs</span>
              <span>Value</span>
              <span>Forecast</span>
              <span>%</span>
            </div>
          </div>
          <div className="p-4 h-full">
            {sectorETFsData.map((sector: SectorETF, index: number) => (
              <div key={index} className={`grid grid-cols-4 gap-4 items-center py-2 text-gray-700 ${index !== sectorETFsData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm truncate" title={sector.name}>{sector.name}</span>
                </div>
                <span className="text-sm ">{sector.value}</span>
                <span className="text-sm ">{sector.forecast}</span>
                <span className={`text-sm ${getChangeColor(sector.change)}`}>
                  {sector.change}
                </span>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
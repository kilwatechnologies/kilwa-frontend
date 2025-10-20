'use client'

import { useState, useEffect } from 'react'
import { marketsApi, countriesApi } from '@/lib/api'

interface Country {
  id: number
  name: string
  isoCode: string
}

interface NewsItem {
  title: string
  source: string
  category: string
  time: string
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

export default function MarketsContent() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  // API data states
  const [macroeconomicData, setMacroeconomicData] = useState<MarketKPI[]>([])
  const [financeData, setFinanceData] = useState<MarketKPI[]>([])
  const [governanceData, setGovernanceData] = useState<MarketKPI[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  // Historical chart data
  const [historicalMacroData, setHistoricalMacroData] = useState<{[year: number]: MarketKPI[]}>({})
  const [historicalLoading, setHistoricalLoading] = useState(false)
  const [selectedYearRange, setSelectedYearRange] = useState(5)
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)

  // Load countries on mount
  useEffect(() => {
    loadCountries()
  }, [])

  // Load market data when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadMarketData()
      loadHistoricalMacroData()
    }
  }, [selectedCountry])

  const loadCountries = async () => {
    try {
      setLoading(true)
      const response = await countriesApi.getAfricanCountries()
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        setCountries(response.data.data)
        setSelectedCountry(response.data.data[0])
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

  const currencies = [
    { pair: 'USD/KES', price: '114.9', change: '+1.21%' },
    { pair: 'EUR/KES', price: '124', change: '+1.21%' },
    { pair: 'GBP/KES', price: '145', change: '+1.21%' },
    { pair: 'JPY/KES', price: '1.0', change: '-2.31%' },
  ]

  const marketNews: NewsItem[] = [
    {
      title: 'Safaricom Reports Record Q3 Profits as Mobile Money Growth Accelerates',
      source: 'Business Daily',
      category: 'Markets',
      time: '9:59 AM'
    },
    {
      title: 'Central Bank of Kenya Maintains Benchmark Rate at 12.75% Amid Inflation',
      source: 'Business Daily',
      category: 'Energy',
      time: '9:59 AM'
    },
    {
      title: 'KenGen Secures $450M Financing for Renewable Energy Projects Expansion',
      source: 'Business Daily',
      category: 'Energy',
      time: '9:59 AM'
    },
    {
      title: 'NSE 20-Share Index Gains 2.1% on Banking Sector Rally',
      source: 'Market Watch',
      category: 'Kenya',
      time: '8:59 AM'
    },
    {
      title: 'NSE 20-Share Index Gains 2.1% on Banking Sector Rally',
      source: 'Market Watch',
      category: 'Kenya',
      time: '9:59 AM'
    },
  ]

  const equityFactors: EquityFactor[] = [
    { name: 'Large', value: '-0.1%', core: '-0.3%', growth: '-0.4%' },
    { name: 'Mid', value: '-0.3%', core: '-0.4%', growth: '-0.5%' },
    { name: 'Small', value: '-0.4%', core: '-0.4%', growth: '-0.3%' },
  ]

  const sectorETFs: SectorETF[] = [
    { name: 'Energy & Renewable Energy', value: '$114.9B', forecast: '$118.3B', change: '+1.21%' },
    { name: 'Technology & Fintech', value: '$2,150', forecast: '$2,310', change: '+1.21%' },
    { name: 'Infrastructure & Real Estate', value: '5.1%', forecast: '5.6%', change: '+1.21%' },
    { name: 'Manufacturing & Industrialization', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Agriculture & Agribusiness', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Tourism & Hospitality', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Financial Markets & Investment', value: '7.8%', forecast: '6.4%', change: '-2.31%' },
  ]

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

  if (loading || !selectedCountry) {
    return (
      <div className="bg-white text-black p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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
              className="bg-white text-gray-900 pl-14 pr-10 py-2 rounded-lg border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none cursor-pointer"
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
        <div className="flex items-center space-x-2 text-gray-600">
          <span>📅</span>
          <span>Sunday, 12 September, 2025</span>
        </div>
      </div>

      {/* Top Row - Macroeconomic, Currencies, Finance */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Macroeconomic Overview */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Macroeconomic Overview</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>Metric</span>
              <span>Value</span>
              <span>Score</span>
            </div>
            {dataLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : macroeconomicData.length > 0 ? (
              macroeconomicData.map((kpi, index) => (
                <div key={kpi.code} className={`grid grid-cols-3 gap-4 items-center py-2 ${index !== macroeconomicData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm text-black">{kpi.name}</span>
                  <span className="text-sm text-black">
                    {kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}
                  </span>
                  <span className="text-sm text-black">
                    {kpi.normalizedValue ? kpi.normalizedValue.toFixed(1) : 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Currencies */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Currencies</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>Pair</span>
              <span>Price</span>
              <span>%</span>
            </div>
            {currencies.map((currency, index) => (
              <div key={index} className={`grid grid-cols-3 gap-4 items-center py-2 ${index !== currencies.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-sm text-black">{currency.pair}</span>
                <span className="text-sm text-black">{currency.price}</span>
                <span className={`text-sm ${getChangeColor(currency.change)}`}>
                  {currency.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Finance</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>External Finance</span>
              <span>Value</span>
              <span>Score</span>
            </div>
            {dataLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : financeData.length > 0 ? (
              financeData.map((kpi, index) => (
                <div key={kpi.code} className={`grid grid-cols-3 gap-4 items-center py-2 ${index !== financeData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm text-black">{kpi.name}</span>
                  <span className="text-sm text-black">
                    {kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}
                  </span>
                  <span className="text-sm text-black">
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

      {/* Second Row - Chart and Market News */}
      <div className="flex gap-6 mb-6">
        {/* Chart Component - Custom width */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '67%' }}>
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Macroeconomic Overview</h3>
          </div>
          <div className="p-4">
            {/* Year Range Selector */}
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((years) => (
                <button
                  key={years}
                  onClick={() => setSelectedYearRange(years)}
                  className={`px-3 py-1 text-xs rounded ${
                    selectedYearRange === years
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-black'
                  }`}
                >
                  {years}Y
                </button>
              ))}
            </div>

            {historicalLoading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : Object.keys(historicalMacroData).length > 0 && getFilteredYears().length > 0 ? (
              <>
                {/* Chart Legend */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-black">
                  {getAllKPIs().map((kpi) => (
                    <div key={kpi.code} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: getKPIColor(kpi.code) }}></div>
                      <span>{kpi.name}</span>
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

        {/* Market News - Custom width */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '33%' }}>
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Market News</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {marketNews.map((news, index) => (
                <div key={index} className={`pb-3 ${index !== marketNews.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <h4 className="text-sm font-medium mb-1 text-black">{news.title}</h4>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{news.source} &gt; {news.category}</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        
        {/* Governance & Risk */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Governance & Risk</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>Indicator</span>
              <span>Value</span>
              <span>Score</span>
            </div>
            {dataLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : governanceData.length > 0 ? (
              governanceData.map((kpi, index) => (
                <div key={kpi.code} className={`grid grid-cols-3 gap-4 items-center py-2 ${index !== governanceData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm text-black">{kpi.name}</span>
                  <span className="text-sm text-black">
                    {kpi.value ? `${kpi.value.toFixed(2)} ${kpi.unit || ''}` : 'N/A'}
                  </span>
                  <span className="text-sm text-black">
                    {kpi.normalizedValue ? kpi.normalizedValue.toFixed(1) : 'N/A'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">No data available</div>
            )}
          </div>
        </div>

        {/* Equity Factors */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Equity Factors</h3>
          </div>
          <div className="p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-3">1-Day Performance</div>
            
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div></div>
              <div className="text-center text-xs text-gray-600 font-medium">Value</div>
              <div className="text-center text-xs text-gray-600 font-medium">Core</div>
              <div className="text-center text-xs text-gray-600 font-medium">Growth</div>
            </div>
            
            {/* Data Rows */}
            {equityFactors.map((factor, index) => (
              <div key={index} className="grid grid-cols-4 gap-3 mb-6">
                <div className="flex items-center text-sm text-black font-medium">{factor.name}</div>
                
                {/* Value Box */}
                <div className="bg-red-100 border border-red-200 rounded-md py-6 px-3 text-center">
                  <span className="text-sm font-medium text-red-800">{factor.value}</span>
                </div>
                
                {/* Core Box */}
                <div className={`${index === 1 ? 'bg-blue-100 border-blue-300 border-2' : 'bg-red-100 border border-red-200'} rounded-md py-6 px-3 text-center`}>
                  <span className={`text-sm font-medium ${index === 1 ? 'text-blue-800' : 'text-red-800'}`}>
                    {factor.core}
                  </span>
                </div>
                
                {/* Growth Box */}
                <div className="bg-red-100 border border-red-200 rounded-md py-6 px-3 text-center">
                  <span className="text-sm font-medium text-red-800">{factor.growth}</span>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Equity Sectors */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Equity Sectors</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>S&P Sector ETFs</span>
              <span>Value</span>
              <span>Forecast</span>
              <span>%</span>
            </div>
            {sectorETFs.map((sector, index) => (
              <div key={index} className={`grid grid-cols-4 gap-4 items-center py-2 ${index !== sectorETFs.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black">{sector.name}</span>
                </div>
                <span className="text-sm text-black">{sector.value}</span>
                <span className="text-sm text-black">{sector.forecast}</span>
                <span className={`text-sm ${getChangeColor(sector.change)}`}>
                  {sector.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
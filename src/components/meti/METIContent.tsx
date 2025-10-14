'use client'

import { useState, useEffect } from 'react'
import { countriesApi } from '@/lib/api'

interface Country {
  id: number
  name: string
  isoCode: string
}

interface SectorData {
  name: string
  outlook: string
  focusMarkets: string
}

interface DriverCategoryData {
  name: string
  contribution: string
  riskLevel: 'Critical' | 'Moderate' | 'Strong'
}

export default function METIContent() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCountries()
  }, [])

  const loadCountries = async () => {
    try {
      setLoading(true)
      const response = await countriesApi.getAfricanCountries()
      if (response.data.success && response.data.data) {
        setCountries(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedCountry(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error)
    } finally {
      setLoading(false)
    }
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

  // Mock data
  const sectorData: SectorData[] = [
    { name: 'Energy & Renewable Energy', outlook: 'Favorable', focusMarkets: 'Solar, Hydro' },
    { name: 'Agriculture & Agribusiness', outlook: 'Favorable', focusMarkets: 'Cocoa, Tea' },
    { name: 'Technology & Fintech', outlook: 'Favorable', focusMarkets: 'Mobile Payments' },
    { name: 'Infrastructure & Real Estate', outlook: 'High-Risk', focusMarkets: 'Urban Housing' },
    { name: 'Manufacturing & Industrialization', outlook: 'Neutral', focusMarkets: 'Textiles, Packaging' },
    { name: 'Tourism & Hospitality', outlook: 'High-Risk', focusMarkets: 'Safari, Wellness' },
    { name: 'Financial Markets & Investment', outlook: 'Neutral', focusMarkets: 'Microfinance, PE' },
  ]

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
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
            {getCountryFlag(selectedCountry.name) ? (
              <img
                src={getCountryFlag(selectedCountry.name)!}
                alt={selectedCountry.name}
                width="40"
                height="40"
                style={{ width: '40px', height: '40px', objectFit: 'cover', display: 'block' }}
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
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span>📅</span>
          <span>Sunday, 12 September, 2025</span>
        </div>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {/* METI Score */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">METI Score</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-black mb-2">Entry Timing</div>
                <div className="text-sm text-gray-600">Strong Bullish</div>
              </div>

              {/* Circular Progress */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray="72, 100"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">72</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zawadi Signal */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Zawadi Signal</h3>
          </div>
          <div className="p-4">
            <div className="text-xl font-semibold text-black mb-2">Strong Entry</div>
            <div className="text-sm text-gray-600 mb-2">Based on multi-signal strength</div>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Bullish
            </div>
          </div>
        </div>

        {/* Sentiment Pulse */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Sentiment Pulse</h3>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-semibold text-black mb-2">Positive</div>
                <div className="text-sm text-gray-600 mb-2">Based on last 30 days</div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600">Upward</span>
                  <span className="text-green-600">📈</span>
                </div>
              </div>
              {/* Mini sentiment chart */}
              <div className="w-16 h-12">
                <svg viewBox="0 0 60 40" className="w-full h-full">
                  <path
                    d="M 0,35 Q 15,25 30,20 T 60,10"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Alerts</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-lg font-semibold text-black">1 Critical / 3 New</span>
            </div>
            <div className="text-sm text-gray-600">METI dipped below 50 in Kenya</div>
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
              {/* Time Period Selector */}
              <div className="inline-flex space-x-2">
                {['1 D', '5 D', '1 M', '3 M', '6 M', 'YTD', '1 Y', '5 Y', '10 Y'].map((period, index) => (
                  <button
                    key={period}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      index === 2 ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4">
              {/* Chart Legend */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-sm">Technology & Fintech</span>
                  <button className="text-gray-400 hover:text-gray-600">×</button>
                </div>
              </div>

              {/* Mock Chart Area with Data Point */}
              <div className="h-80 bg-gray-50 rounded relative">
                <div className="absolute top-4 right-4 bg-white border rounded p-3 text-xs shadow-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Technology & Fintech 03/05/25</span>
                  </div>
                  <div className="space-y-1 mt-2">
                    <div>METI Score: <strong>87</strong></div>
                    <div>Status: <span className="text-green-600">Optimal</span></div>
                    <div>Change: <span className="text-green-600">+1.21%</span></div>
                  </div>
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-4">
                  <span>100.00</span>
                  <span>75.00</span>
                  <span>50.00</span>
                  <span>25.00</span>
                  <span>0.00</span>
                </div>

                {/* X-axis labels */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-gray-500 px-8">
                  <span>Oct 2024</span>
                  <span>Jan 2025</span>
                  <span>Apr 2025</span>
                  <span>Jul 2025</span>
                  <span>Aug 2025</span>
                </div>

                {/* Mock chart line - Purple trend */}
                <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 800 320" preserveAspectRatio="none">
                  <path
                    d="M 50,250 L 100,230 L 150,220 L 200,210 L 250,200 L 300,190 L 350,185 L 400,180 L 450,160 L 500,140 L 550,130 L 600,150 L 650,160 L 700,155 L 750,150"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                  />
                  {/* Data point circle */}
                  <circle cx="650" cy="160" r="4" fill="#a855f7" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sectors Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">Sector</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
                <span>Sector</span>
                <span>Zawadi AI Outlook</span>
                <span>Focus Markets</span>
              </div>

              {sectorData.map((sector, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-3 gap-4 items-center py-3 ${
                    index !== sectorData.length - 1 ? 'border-b border-gray-100' : ''
                  } ${sector.name === 'Technology & Fintech' ? 'bg-purple-50' : ''}`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      defaultChecked={sector.name === 'Technology & Fintech'}
                    />
                    <span className="text-sm text-black">{sector.name}</span>
                  </div>
                  <span className={`text-sm ${getOutlookColor(sector.outlook)}`}>
                    {sector.outlook}
                  </span>
                  <span className="text-sm text-gray-600">{sector.focusMarkets}</span>
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
                <h3 className="text-sm font-semibold text-black">Driver Category</h3>
                <span className="text-sm text-gray-600 text-center min-w-[80px]">Contribution</span>
                <span className="text-sm text-gray-600 text-center min-w-[100px]">Risk Level</span>
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
                  <span className="text-sm text-black leading-tight">{category.name}</span>
                  <span className="text-sm text-black text-center min-w-[60px]">{category.contribution}</span>
                  <div className="flex items-center space-x-2 min-w-[100px]">
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
                {/* Kenya Brief */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-black">Kenya</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">High Confidence</span>
                      <span className="text-xs text-gray-500">Updated 2 hours ago</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-black mb-2 flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                        Setup
                      </h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Macro is stabilizing: headline CPI is 4.5% y/y (Aug-2025), within target, and the CBK has begun
                        measured easing to 9.50%—a supportive backdrop for duration and capex plans. Recent liability-management
                        steps (Eurobond refinancing/buybacks) and a steadier shilling have reduced near-term funding risk.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-black mb-2 flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                        Positioning
                      </h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Macro is stabilizing: headline CPI is 4.5% y/y (Aug-2025), within target, and the CBK has begun
                        measured easing to 9.50%—a supportive backdrop for duration and capex plans. Recent liability-management
                        steps (Eurobond refinancing/buybacks) and a steadier shilling have reduced near-term funding risk.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Generated by Zawadi AI using NLG models.
                  </div>
                </div>

                {/* Additional content to demonstrate scrolling */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-black">Nigeria</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-yellow-600">Medium Confidence</span>
                      <span className="text-xs text-gray-500">Updated 4 hours ago</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-black mb-2 flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                        Market Overview
                      </h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Nigeria&apos;s economic indicators show mixed signals with inflation remaining elevated at 24.08% y/y
                        but showing signs of deceleration. The CBN has maintained a hawkish stance with rates at 26.75%,
                        supporting the naira&apos;s stability in recent months.
                      </p>
                    </div>

                    <div>
                      <h5 className="font-medium text-black mb-2 flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                        Investment Outlook
                      </h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Focus on oil and gas sector resilience alongside emerging fintech opportunities.
                        Infrastructure investments remain challenging but offer long-term value creation potential
                        for patient capital strategies.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Generated by Zawadi AI using NLG models.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

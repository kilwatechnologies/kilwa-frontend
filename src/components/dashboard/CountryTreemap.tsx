'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Country {
  id: number
  name: string
  isoCode: string
  region?: string
  isiScore?: number
  metiScore?: number
  sentimentPulse?: string
  debtToGDP?: number
}

interface CountryTreemapProps {
  countries: Country[]
  onCountryClick?: (country: Country) => void
  onToggleFilters?: () => void
  selectedSectors?: Record<string, boolean>
}

export default function CountryTreemap({ countries, onCountryClick, onToggleFilters, selectedSectors }: CountryTreemapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Debug logging
  useEffect(() => {
    console.log('CountryTreemap received countries:', countries)
    countries.forEach(country => {
      console.log(`${country.name} (${country.isoCode}): ISI Score = ${country.isiScore}`)
    })
  }, [countries])

  // Filter countries based on search query
  const filteredCountries = countries.filter(country => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      country.name.toLowerCase().includes(query) ||
      country.isoCode.toLowerCase().includes(query)
    )
  })

  // Group countries by region for layout
  const groupedCountries = filteredCountries.reduce((acc, country) => {
    const region = country.region || 'Other'
    if (!acc[region]) acc[region] = []
    acc[region].push(country)
    return acc
  }, {} as Record<string, Country[]>)

  // Get color based on ISI score
  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-300'
    if (score >= 70) return 'bg-green-900'
    if (score >= 60) return 'bg-gray-800'
    if (score >= 50) return 'bg-green-600'
    if (score >= 40) return 'bg-red-700'
    return 'bg-red-700'
  }

  // Get text color based on background
  const getTextColor = (score?: number) => {
    if (!score) return 'text-gray-700'
    if (score >= 50) return 'text-white'
    return 'text-white'
  }

  // Get country flag path
  const getCountryFlag = (countryName: string): string | null => {
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

  // Calculate width percentage based on debt to GDP ratio
  const getCountryWidthPercent = (debtToGDP?: number, totalDebt?: number) => {
    if (!debtToGDP || !totalDebt || totalDebt === 0) {
      return 33.33 // Default equal distribution
    }

    // Calculate percentage of total debt
    return (debtToGDP / totalDebt) * 100
  }

  const renderTreemapRegion = (regionName: string, regionCountries: Country[]) => {
    // Calculate total debt to GDP for the region
    const totalDebt = regionCountries.reduce((sum, country) => {
      return sum + (country.debtToGDP || 0)
    }, 0)

    // Fixed height for all boxes in the region
    const fixedHeight = 180

    return (
      <div key={regionName} className="mb-8">
        <div className="text-sm text-white mb-3 font-medium">{regionName}</div>
        <div className="flex gap-1" style={{ height: `${fixedHeight}px` }}>
          {regionCountries.map((country) => {
            const widthPercent = getCountryWidthPercent(country.debtToGDP, totalDebt)
            return (
              <div
                key={country.id}
                className={`
                  ${getScoreColor(country.isiScore)}
                  ${getTextColor(country.isiScore)}
                  cursor-pointer transition-all duration-200
                  hover:opacity-90 hover:shadow-lg
                  flex flex-col justify-between p-3
                  relative overflow-hidden
                `}
                style={{
                  width: `${widthPercent}%`,
                  minWidth: '120px',
                  height: '100%'
                }}
                onClick={() => onCountryClick?.(country)}
                onMouseEnter={(e) => {
                  setHoveredCountry(country)
                  const rect = e.currentTarget.getBoundingClientRect()
                  setMousePosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                  })
                }}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <div className="flex flex-col h-full justify-center items-center text-center">
                  <div className="font-bold text-2xl">
                    {country.isoCode || country.name.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="text-sm opacity-90 leading-tight mt-1">
                    {country.name}
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    {country.isiScore ? `${country.isiScore.toFixed(1)}` : 'N/A'}
                  </div>
                  {country.isiScore && (
                    <div className="text-xs opacity-90">
                      ISI Score
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-black flex flex-col relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#B0B2B2' }}>
                {selectedSectors && Object.values(selectedSectors).some(Boolean)
                  ? 'Countries ranked by sector-weighted ISI scores. Box size represents GDP.'
                  : 'African countries categorized by region and sector. Box size represents GDP.'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {showSearch ? (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setShowSearch(false)
                    }}
                    autoFocus
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm placeholder-[#B0B2B2] focus:outline-none focus:border-gray-600 w-64"
                  />
                  <svg className="w-5 h-5 text-[#B0B2B2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setShowSearch(false)
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B2B2] hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <svg className="w-5 h-5 text-[#B0B2B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onToggleFilters}
                className="px-3 py-1  text-[#B0B2B2] rounded-lg text-sm "
              >
                Fullscreen
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title="Zoom In"
              >
                <svg className="w-5 h-5 text-[#B0B2B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
                className="p-2 hover:bg-gray-800 rounded-lg"
                title="Zoom Out"
              >
                <svg className="w-5 h-5 text-[#B0B2B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Country Treemap */}
          <div
            className="space-y-6 transition-transform duration-300 origin-top-left"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {Object.entries(groupedCountries).map(([region, regionCountries]) =>
              renderTreemapRegion(region, regionCountries)
            )}
          </div>
        </div>
      </div>

      {/* Legend - Fixed at bottom of main content area */}
      <div className=" border-t border-gray-700 px-6 py-3 flex items-center justify-between text-xs z-20">
        <div className="flex items-center text-[#B0B2B2] flex-1 min-w-0 mr-4">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden 2xl:inline">Scroll to zoom, drag to pan. Double-click a country for details. Hover to view competitors with 3-month trend.</span>
          <span className="2xl:hidden">Scroll to zoom, drag to pan. Double-click for details.</span>
        </div>
        <div className="flex items-center">
          <div className="flex rounded overflow-hidden border border-gray-600">
            <div className="bg-red-700 px-4 py-3 text-white text-xs font-medium">0-50</div>           
            <div className="bg-green-600 px-4 py-3 text-white text-xs font-medium">50-60</div>
            <div className="bg-gray-800 px-4 py-3 text-white text-xs font-medium">60-70</div>
            <div className="bg-green-900 px-4 py-3 text-white text-xs font-medium">70-100</div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCountry && (
        <div
          className="fixed bg-white text-black p-6 rounded-xl shadow-2xl z-30 w-80 border border-gray-200 pointer-events-none"
          style={{
            left: `${Math.min(mousePosition.x + 20, window.innerWidth - 350)}px`,
            top: `${Math.max(20, Math.min(mousePosition.y - 200, window.innerHeight - 450))}px`,
          }}
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {hoveredCountry.name} ({hoveredCountry.isoCode})
            </h3>
            <div className="text-sm font-medium text-[#1E1E1E] mt-1">
              Zawadi's AI Insights
            </div>
            <div className="text-sm text-[#686868] mt-1">
              {hoveredCountry.name} shows investment potential in various sectors.
            </div>
          </div>

          {/* Country Flag Section */}
          <div className="mb-4 p-3 bg-gray-900 rounded-lg">
            <div className="flex items-center text-white">
              {getCountryFlag(hoveredCountry.name) ? (
                <Image
                  src={getCountryFlag(hoveredCountry.name)!}
                  alt={hoveredCountry.name}
                  width={24}
                  height={16}
                  className="rounded-sm mr-2 object-cover"
                />
              ) : (
                <div className="w-6 h-4 bg-green-600 rounded-sm mr-2"></div>
              )}
              <span className="text-sm font-medium">
                {hoveredCountry.isoCode} - {hoveredCountry.name}
              </span>
            </div>
            <div className="text-xs text-gray-300 mt-1">{hoveredCountry.region}</div>
          </div>

          {/* Key Metrics */}
          <div className="mb-4">
            <div className="text-sm  text-[#4B4B4B] mb-3">Key Metrics</div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-[#1E1E1E] ">ISI Score</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {hoveredCountry.isiScore?.toFixed(0) || 'N/A'}/100
                  </span>
                  {hoveredCountry.isiScore && hoveredCountry.isiScore >= 60 && (
                    <span className="text-xs text-green-600 ml-2 px-2 py-1 bg-green-100 rounded">
                      Favourable
                    </span>
                  )}
                  {hoveredCountry.isiScore && hoveredCountry.isiScore < 60 && hoveredCountry.isiScore >= 40 && (
                    <span className="text-xs text-yellow-600 ml-2 px-2 py-1 bg-yellow-100 rounded">
                      Neutral
                    </span>
                  )}
                  {hoveredCountry.isiScore && hoveredCountry.isiScore < 40 && (
                    <span className="text-xs text-red-600 ml-2 px-2 py-1 bg-red-100 rounded">
                      Caution
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-[#1E1E1E]">METI Signal</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {hoveredCountry.metiScore ? `${hoveredCountry.metiScore.toFixed(0)}/100` : '--/100'}
                  </span>
                  {hoveredCountry.metiScore ? (
                    hoveredCountry.metiScore >= 60 ? (
                      <span className="text-xs text-green-600 ml-2 px-2 py-1 bg-green-100 rounded">
                        Favourable
                      </span>
                    ) : hoveredCountry.metiScore >= 40 ? (
                      <span className="text-xs text-yellow-600 ml-2 px-2 py-1 bg-yellow-100 rounded">
                        Neutral
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 ml-2 px-2 py-1 bg-red-100 rounded">
                        Caution
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-gray-500 ml-2 px-2 py-1 bg-gray-100 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-[#1E1E1E]">Sentiment Pulse</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    {hoveredCountry.sentimentPulse || 'Neutral'}
                  </span>
                  <div className="w-8 h-4 ml-2">
                    <svg viewBox="0 0 32 16" className="w-full h-full">
                      <polyline
                        points={
                          hoveredCountry.sentimentPulse?.toLowerCase() === 'positive'
                            ? "0,12 8,8 16,10 24,6 32,4"
                            : hoveredCountry.sentimentPulse?.toLowerCase() === 'negative'
                            ? "0,4 8,6 16,10 24,8 32,12"
                            : "0,8 8,8 16,8 24,8 32,8"
                        }
                        fill="none"
                        stroke={
                          hoveredCountry.sentimentPulse?.toLowerCase() === 'positive'
                            ? "#10b981"
                            : hoveredCountry.sentimentPulse?.toLowerCase() === 'negative'
                            ? "#ef4444"
                            : "#6b7280"
                        }
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-xs text-gray-400 text-center pt-3 border-t border-gray-100">
            Last Updated: Dec 2024
          </div>
        </div>
      )}
    </div>
  )
}
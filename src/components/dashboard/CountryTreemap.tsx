'use client'

import { useState, useEffect } from 'react'

interface Country {
  id: number
  name: string
  isoCode: string
  region?: string
  isiScore?: number
}

interface CountryTreemapProps {
  countries: Country[]
  onCountryClick?: (country: Country) => void
}

export default function CountryTreemap({ countries, onCountryClick }: CountryTreemapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null)

  // Debug logging
  useEffect(() => {
    console.log('CountryTreemap received countries:', countries)
    countries.forEach(country => {
      console.log(`${country.name} (${country.isoCode}): ISI Score = ${country.isiScore}`)
    })
  }, [countries])

  // Group countries by region for layout
  const groupedCountries = countries.reduce((acc, country) => {
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

  // Calculate size based on ISI score for treemap layout
  const getCountrySize = (score: number | undefined, totalScore: number) => {
    if (!score) return { width: 120, height: 80 }
    
    // Calculate relative size based on ISI score
    const minSize = 100
    const maxSize = 300
    const normalizedScore = Math.max(score, 30) // Minimum threshold
    const sizeRatio = normalizedScore / 100
    
    const width = Math.floor(minSize + (maxSize - minSize) * sizeRatio)
    const height = Math.floor((minSize + (maxSize - minSize) * sizeRatio) * 0.7) // Make height 70% of width
    
    return { width, height }
  }

  const renderTreemapRegion = (regionName: string, regionCountries: Country[]) => {
    const totalScore = regionCountries.reduce((sum, country) => sum + (country.isiScore || 0), 0)
    
    return (
      <div key={regionName} className="mb-8">
        <div className="text-sm text-gray-400 mb-3 font-medium">{regionName}</div>
        <div className="flex flex-wrap gap-1" style={{ alignItems: 'flex-start' }}>
          {regionCountries.map((country) => {
            const size = getCountrySize(country.isiScore, totalScore)
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
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  minWidth: '100px',
                  minHeight: '70px'
                }}
                onClick={() => onCountryClick?.(country)}
                onMouseEnter={() => setHoveredCountry(country)}
                onMouseLeave={() => setHoveredCountry(null)}
              >
                <div className="flex flex-col h-full justify-between text-left">
                  <div>
                    <div className="font-bold text-xl mb-1">
                      {country.isoCode || country.name.substring(0, 3).toUpperCase()}
                    </div>
                    <div className="text-sm opacity-90 leading-tight">
                      {country.name}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="text-2xl font-bold">
                      {country.isiScore ? `${country.isiScore.toFixed(1)}` : 'N/A'}
                    </div>
                    {country.isiScore && (
                      <div className="text-xs opacity-90">
                        ISI Score
                      </div>
                    )}
                  </div>
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
              <p className="text-sm text-gray-400">
                African countries categorized by region and sector. Box size represents ISI score.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-800 rounded-lg">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="px-3 py-1 bg-gray-800 border border-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
                Fullscreen
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Country Treemap */}
          <div className="space-y-6">
            {Object.entries(groupedCountries).map(([region, regionCountries]) =>
              renderTreemapRegion(region, regionCountries)
            )}
          </div>
        </div>
      </div>

      {/* Legend - Fixed at bottom of main content area */}
      <div className=" border-t border-gray-700 px-6 py-3 flex items-center justify-between text-xs z-20">
        <div className="flex items-center text-gray-300 flex-1 min-w-0 mr-4">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden 2xl:inline">Scroll to zoom, drag to pan. Double-click a country for details. Hover to view competitors with 3-month trend.</span>
          <span className="2xl:hidden">Scroll to zoom, drag to pan. Double-click for details.</span>
        </div>
        <div className="flex items-center">
          <div className="flex rounded overflow-hidden border border-gray-600">
            <div className="bg-red-700 px-4 py-3 text-white text-xs font-medium">0-50</div>           
            <div className="bg-green-600 px-4 py-3 text-black text-xs font-medium">50-60</div>
            <div className="bg-gray-800 px-4 py-3 text-white text-xs font-medium">60-70</div>
            <div className="bg-green-900 px-4 py-3 text-white text-xs font-medium">70-100</div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCountry && (
        <div className="fixed bottom-20 left-4 bg-white text-black p-6 rounded-xl shadow-2xl z-30 max-w-sm border border-gray-200">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {hoveredCountry.name} ({hoveredCountry.isoCode})
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              Zawadi's AI Insights
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {hoveredCountry.name} shows investment potential in various sectors.
            </div>
          </div>

          {/* Country Flag Section */}
          <div className="mb-4 p-3 bg-gray-900 rounded-lg">
            <div className="flex items-center text-white">
              <div className="w-6 h-4 bg-green-600 rounded-sm mr-2"></div>
              <span className="text-sm font-medium">
                {hoveredCountry.isoCode} - {hoveredCountry.name}
              </span>
            </div>
            <div className="text-xs text-gray-300 mt-1">{hoveredCountry.region}</div>
          </div>

          {/* Key Metrics */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Key Metrics</div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ISI Score</span>
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

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">METI Signal</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900">--/100</span>
                  <span className="text-xs text-gray-500 ml-2 px-2 py-1 bg-gray-100 rounded">
                    Pending
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sentiment Pulse</span>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-900">Positive</span>
                  <div className="w-8 h-4 ml-2">
                    <svg viewBox="0 0 32 16" className="w-full h-full">
                      <polyline
                        points="0,12 8,8 16,10 24,6 32,4"
                        fill="none"
                        stroke="#10b981"
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
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Treemap, ResponsiveContainer } from 'recharts'

interface Country {
  id: number
  name: string
  isoCode: string
  region?: string
  isiScore?: number
  metiScore?: number
  sentimentPulse?: string
  gdpGrowth?: number
  gdpValue?: number
}

interface SectorData {
  sector_name: string
  value: number
  change_percent: number
}

interface CountryTreemapProps {
  countries: Country[]
  onCountryClick?: (country: Country) => void
  onToggleFilters?: () => void
  filtersCollapsed?: boolean
  selectedSectors?: Record<string, boolean>
  displayMetric?: 'isi' | 'meti' | 'sentiment'
  sectorData?: SectorData[]
}

export default function CountryTreemap({ countries, onCountryClick, onToggleFilters, filtersCollapsed = false, selectedSectors, displayMetric = 'isi', sectorData }: CountryTreemapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Get the display value based on selected metric
  const getDisplayValue = (country: Country): { value: string | number, label: string } => {
    switch (displayMetric) {
      case 'meti':
        return {
          value: country.metiScore ? country.metiScore.toFixed(1) : 'N/A',
          label: 'METI Score'
        }
      case 'sentiment':
        return {
          value: country.sentimentPulse || 'N/A',
          label: 'Sentiment'
        }
      case 'isi':
      default:
        return {
          value: country.isiScore ? `${country.isiScore.toFixed(1)}%` : 'N/A',
          label: 'ISI Score'
        }
    }
  }

  // Get the score value for color calculation
  const getScoreValue = (country: Country): number | undefined => {
    switch (displayMetric) {
      case 'meti':
        return country.metiScore
      case 'sentiment':
        // For sentiment, we'll use isiScore for coloring as fallback
        return country.isiScore
      case 'isi':
      default:
        return country.isiScore
    }
  }

  // Get text color based on background
  const getTextColor = (country: Country) => {
    const score = getScoreValue(country)
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

  // Map 2-letter ISO codes to 3-letter ISO codes
  const getThreeLetterCode = (country: Country): string => {
    const isoCodeMap: { [key: string]: string } = {
      'NG': 'NGA',
      'GH': 'GHA',
      'KE': 'KEN',
      'ZA': 'ZAF',
      'EG': 'EGY',
      'MA': 'MAR',
      'ET': 'ETH',
      'TZ': 'TZA',
      'BW': 'BWA',
      'RW': 'RWA',
      'TN': 'TUN',
      'MU': 'MUS',
    }
    return isoCodeMap[country.isoCode] || country.isoCode || country.name.substring(0, 3).toUpperCase()
  }

  // Prepare treemap data based on GDP values
  const getTreemapData = () => {
    // Add minimum size to ensure all countries are visible with proper width
    // Small countries: Rwanda (14.77B), Mauritius (15.73B), Botswana (19.19B), Tunisia (59.07B)
    const minSize = 100 // Increased to ensure boxes have enough width for text
    return filteredCountries.map(country => ({
      name: country.name,
      size: Math.max(country.gdpValue || 50, minSize), // Ensure minimum size
      country: country,
      fill: getScoreColorHex(country)
    }))
  }

  // Get hex color based on score
  const getScoreColorHex = (country: Country) => {
    const score = getScoreValue(country)
    if (!score) return '#9CA3AF'
    if (score >= 70) return '#2A503A'
    if (score >= 60) return '#2B3334'
    if (score >= 50) return '#2A7C4D'
    if (score >= 40) return '#BB3430'
    return '#B91C1C'
  }

  // Custom treemap cell content
  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, index } = props
    const country = filteredCountries[index]
    if (!country) return null

    const displayValue = getDisplayValue(country)

    // Dynamic font sizing based on box dimensions - more aggressive to prevent overflow
    const isoCodeSize = Math.max(8, Math.min(width / 4, height / 4, 20))
    const nameSize = Math.max(7, Math.min(width / 12, height / 10, 11))
    const scoreSize = Math.max(8, Math.min(width / 6, height / 6, 16))
    const labelSize = Math.max(7, Math.min(width / 14, height / 12, 10))

    // Ultra aggressive thresholds - show content in even the tiniest boxes
    const showIsoCode = width > 25 && height > 20
    const showName = width > 45 && height > 35
    const showScore = width > 65 && height > 50
    const showLabel = width > 95 && height > 70

    // Calculate vertical positions based on what's showing
    const centerY = y + height / 2
    let isoY = centerY
    let nameY = centerY
    let scoreY = centerY
    let labelY = centerY

    if (showScore && showLabel) {
      // When showing all elements, center them with tight spacing
      const gap = 15 // Space between elements
      isoY = centerY - gap
      scoreY = centerY + gap
      labelY = centerY + gap * 3
    } else if (showScore) {
      // Center ISO code and score with proper spacing
      const gap = 15 // Space between ISO code and score
      isoY = centerY - gap
      scoreY = centerY + gap
    } else if (showName) {
      isoY = centerY - nameSize - 5
      nameY = centerY + nameSize / 2
    } else {
      // When showing only ISO code, center it
      isoY = centerY
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: getScoreColorHex(country),
            stroke: '#000',
            strokeWidth: 2,
            cursor: 'pointer',
            opacity: hoveredCountry?.id === country.id ? 0.85 : 1,
            transition: 'opacity 0.2s'
          }}
          onClick={() => onCountryClick?.(country)}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current)
              hoverTimeoutRef.current = null
            }
            setHoveredCountry(country)
            const svg = document.querySelector('svg')
            if (svg) {
              const rect = svg.getBoundingClientRect()
              setMousePosition({
                x: rect.left + x + width / 2,
                y: rect.top + y + height / 2
              })
            }
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredCountry(null)
            }, 100)
          }}
        />
        {showIsoCode && (
          <text
            x={x + width / 2}
            y={isoY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            stroke="none"
            fontSize={isoCodeSize}
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {getThreeLetterCode(country)}
          </text>
        )}

        {showScore && (
          <text
            x={x + width / 2}
            y={scoreY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            stroke="none"
            fontSize={scoreSize}
            fontWeight="normal"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {displayValue.value}
          </text>
        )}
       
      </g>
    )
  }

  return (
    <div className="flex-1 bg-[#1E1E1E] flex flex-col relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 pb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[14px]" style={{ color: '#B0B2B2' }}>
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
                    className="pl-10 pr-4 py-2 bg-[#323131] border border-[#4B4B4B] text-white rounded-lg text-sm placeholder-[#B0B2B2] focus:outline-none focus:border-[#4B4B4B] w-64"
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
                  className="p-2 hover:bg-[#4B4B4B] rounded-lg"
                >
                  <svg className="w-5 h-5 text-[#B0B2B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onToggleFilters}
                className="flex items-center gap-2 px-3 py-1 text-[#B0B2B2] hover:bg-[#4B4B4B] rounded-lg text-sm transition-colors"
              >
                {filtersCollapsed ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Fullscreen
                  </>
                )}
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
                className="p-2 hover:bg-[#4B4B4B] rounded-lg"
                title="Zoom In"
              >
                <svg className="w-5 h-5 text-[#B0B2B2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
                className="p-2 hover:bg-[#4B4B4B] rounded-lg"
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
            className="transition-transform duration-300 origin-top-left"
            style={{
              transform: `scale(${zoomLevel})`,
              minHeight: '500px',
              height: 'calc(100vh - 300px)',
              maxHeight: '700px',
              width: '100%'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={getTreemapData()}
                dataKey="size"
                stroke="#000"
                fill="#FFF"
                content={<CustomTreemapContent />}
                isAnimationActive={false}
                aspectRatio={4/3}
              />
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend - Fixed at bottom of main content area */}
      <div className=" border-t border-[#4B4B4B] px-6 py-3 flex items-center justify-between text-[12px] z-20">
        <div className="flex items-center text-[#B0B2B2] flex-1 min-w-0 mr-4">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden 2xl:inline">Scroll to zoom, drag to pan. Double-click a country for details. Hover to view competitors with 3-month trend.</span>
          <span className="2xl:hidden">Scroll to zoom, drag to pan. Double-click for details.</span>
        </div>
        <div className="flex items-center">
          <div className="flex rounded overflow-hidden border border-[#4B4B4B]">
            <div className="bg-[#BB3430] px-4 py-3 text-white text-xs font-medium">0-50</div>           
            <div className="bg-[#2A7C4D] px-4 py-3 text-white text-xs font-medium">50-60</div>
            <div className="bg-[#2B3334] px-4 py-3 text-white text-xs font-medium">60-70</div>
            <div className="bg-[#2A503A] px-4 py-3 text-white text-xs font-medium">70-100</div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredCountry && (
        <div
          className="fixed bg-white text-black p-6 rounded-xl shadow-2xl z-30 w-[442px] border border-gray-200 max-h-[500px] overflow-y-auto pointer-events-auto"
          style={{
            left: mousePosition.x + 482 > window.innerWidth
              ? `${window.innerWidth - 482}px`
              : `${mousePosition.x + 20}px`,
            top: `${Math.max(20, Math.min(mousePosition.y - 200, window.innerHeight - 520))}px`,
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current)
              hoverTimeoutRef.current = null
            }
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredCountry(null)
            }, 100)
          }}
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-[24px] font-bold text-[#1E1E1E]">
              {hoveredCountry.name} ({hoveredCountry.isoCode})
            </h3>
            <div className="text-[20px] font-medium text-[#1E1E1E] mt-1">
              Zawadi's AI Insights
            </div>
            <div className="text-[16px] text-[#686868] mt-1">
              {hoveredCountry.name} shows investment potential in various sectors.
            </div>
          </div>

          {/* Country Flag Section */}
          <div className="mb-4 p-3 bg-[#1E1E1E] rounded-lg">
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
              <span className="text-lg font-semibold">
                {hoveredCountry.isoCode} - {hoveredCountry.name}
              </span>
            </div>
            <div className="text-xs text-gray-300 mt-1">{hoveredCountry.region}</div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8">
            <div className="text-[14px]  text-[#4B4B4B] mb-3">Key Metrics</div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-[16px] font-medium text-[#1E1E1E] ">ISI Score</span>
                <div className="flex items-center">
                  <span className="text-[18px]  text-[#4B4B4B]">
                    {hoveredCountry.isiScore?.toFixed(0) || 'N/A'}/100
                  </span>
                  {hoveredCountry.isiScore && hoveredCountry.isiScore >= 60 && (
                    <span className="text-[14px] text-[#027A48] ml-2 px-2 py-1 bg-[#E1FFEE] rounded-full">
                      Favourable
                    </span>
                  )}
                  {hoveredCountry.isiScore && hoveredCountry.isiScore < 60 && hoveredCountry.isiScore >= 40 && (
                    <span className="text-[14px] text-[#7A6C02] ml-2 px-2 py-1 bg-[#FFF7C4] rounded-full">
                      Neutral
                    </span>
                  )}
                  {hoveredCountry.isiScore && hoveredCountry.isiScore < 40 && (
                    <span className="text-[14px] text-red-600 ml-2 px-2 py-1 bg-red-100 rounded-full">
                      Caution
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-[16px] font-medium text-[#1E1E1E]">METI Signal</span>
                <div className="flex items-center">
                  <span className="text-[18px]  text-[#4B4B4B]">
                    {hoveredCountry.metiScore ? `${hoveredCountry.metiScore.toFixed(0)}/100` : '--/100'}
                  </span>
                  {hoveredCountry.metiScore ? (
                    hoveredCountry.metiScore >= 60 ? (
                      <span className="text-[16px] text-[#027A48] ml-2 px-2 py-1 bg-[#E1FFEE] rounded-full">
                        Favourable
                      </span>
                    ) : hoveredCountry.metiScore >= 40 ? (
                      <span className="text-[16px] text-[#7A6C02] ml-2 px-2 py-1 bg-[#FFF7C4] rounded-full">
                        Neutral
                      </span>
                    ) : (
                      <span className="text-[16px] text-red-600 ml-2 px-2 py-1 bg-red-100 rounded-full">
                        Caution
                      </span>
                    )
                  ) : (
                    <span className="text-[16px] text-gray-500 ml-2 px-2 py-1 bg-gray-100 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[16px] font-medium text-[#1E1E1E]">Sentiment Pulse</span>
                <div className="flex items-center">
                  <span className="text-[18px]  text-[#4B4B4B]">
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

          {/* Sector Insights */}
          {sectorData && sectorData.length > 0 && (
            <div className="mb-4">
              <div className="text-[14px] text-[#4B4B4B] mb-3">Sector Insights</div>
              <div className="space-y-2">
                {sectorData.map((sector, index) => (
                  <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-[16px] font-[500] text-[#1E1E1E]">{sector.sector_name}</span>
                    <span className={`text-[18px] font-[400] text-[#1E1E1E]`}>
                      {sector.change_percent >= 0 ? '+' : ''}{sector.change_percent.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-400 text-right pt-3 border-t border-gray-100">
            Last Updated: Dec 2024
          </div>
        </div>
      )}
    </div>
  )
}
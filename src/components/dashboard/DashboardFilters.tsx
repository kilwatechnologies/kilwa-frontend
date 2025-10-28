'use client'

import { useState } from 'react'

interface DashboardFiltersProps {
  onFiltersChange: (filters: any) => void
  isCollapsed?: boolean
}

export default function DashboardFilters({ onFiltersChange, isCollapsed = false }: DashboardFiltersProps) {
  const [filters, setFilters] = useState({
    displayMetric: 'isi', // 'isi', 'meti', or 'sentiment'
    performance: '1-day',
    sectors: {
      energy: false,
      technology: false,
      infrastructure: false,
      agriculture: false,
      manufacturing: false,
      tourism: false,
      financial: false,
      healthcare: false,
    }
  })

  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null)

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const updateSector = (sector: string, checked: boolean) => {
    // Only allow one sector to be selected at a time
    let newSectors = { ...filters.sectors }
    if (checked) {
      // Uncheck all other sectors
      Object.keys(newSectors).forEach(key => {
        newSectors[key as keyof typeof newSectors] = false
      })
      // Check the selected sector
      newSectors[sector as keyof typeof newSectors] = true
    } else {
      // Uncheck the sector
      newSectors[sector as keyof typeof newSectors] = false
    }
    const newFilters = { ...filters, sectors: newSectors }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className={`bg-black pt-2 ${isCollapsed ? 'w-0 overflow-hidden' : 'w-80 border-r border-gray-700'} transition-all duration-300 overflow-y-auto hidden lg:block`}>
      {/* Filter Content - Only show when expanded */}
      {!isCollapsed && (
        <div className="p-6">
          {/* Map Filters */}
          <div className="mb-6">
        <h3 className="text-base font-semibold text-[#686969] mb-4">Map Filters</h3>
        
        {/* Where to invest - ISI */}
        <div className="mb-4 relative">
          <div className="flex items-center text-sm">
            <span
              className={`cursor-pointer transition-colors ${filters.displayMetric === 'isi' ? 'text-white font-semibold' : 'text-[#B0B2B2]'}`}
              onClick={() => updateFilter('displayMetric', 'isi')}
            >
              Where to invest - ISI
            </span>
            <div
              className="relative ml-auto"
              onMouseEnter={() => setHoveredInfo('isi')}
              onMouseLeave={() => setHoveredInfo(null)}
            >
              <svg className="w-4 h-4 text-[#B0B2B2] cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {hoveredInfo === 'isi' && (
                <div className="fixed left-80 w-72 bg-white text-black p-4 rounded-lg shadow-xl z-[100] text-xs border border-gray-200">
                  <div className="font-semibold mb-2">Investment Stability Index (ISI)</div>
                  <div className="text-gray-700">
                    ISI measures a country's overall investment climate by analyzing macroeconomic, financial, and governance indicators. Higher scores indicate more favorable conditions for investment.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* When to invest - METI */}
        <div className="mb-4 relative">
          <div className="flex items-center text-sm">
            <span
              className={`cursor-pointer transition-colors ${filters.displayMetric === 'meti' ? 'text-white font-semibold' : 'text-[#B0B2B2]'}`}
              onClick={() => updateFilter('displayMetric', 'meti')}
            >
              When to invest - METI
            </span>
            <div
              className="relative ml-auto"
              onMouseEnter={() => setHoveredInfo('meti')}
              onMouseLeave={() => setHoveredInfo(null)}
            >
              <svg className="w-4 h-4 text-[#B0B2B2] cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {hoveredInfo === 'meti' && (
                <div className="fixed left-80 w-72 bg-white text-black p-4 rounded-lg shadow-xl z-[100] text-xs border border-gray-200">
                  <div className="font-semibold mb-2">Market Entry Timing Index (METI)</div>
                  <div className="text-gray-700">
                    METI analyzes market momentum and timing signals to identify optimal entry points for investments. It considers economic trends, market cycles, and timing indicators.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market mood - Sentiment Pulse */}
        <div className="mb-6 relative">
          <div className="flex items-center text-sm">
            <span
              className={`cursor-pointer transition-colors ${filters.displayMetric === 'sentiment' ? 'text-white font-semibold' : 'text-[#B0B2B2]'}`}
              onClick={() => updateFilter('displayMetric', 'sentiment')}
            >
              Market mood - Sentiment Pulse
            </span>
            <div
              className="relative ml-auto"
              onMouseEnter={() => setHoveredInfo('sentiment')}
              onMouseLeave={() => setHoveredInfo(null)}
            >
              <svg className="w-4 h-4 text-[#B0B2B2] cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {hoveredInfo === 'sentiment' && (
                <div className="fixed left-80 w-72 bg-white text-black p-4 rounded-lg shadow-xl z-[100] text-xs border border-gray-200">
                  <div className="font-semibold mb-2">Sentiment Pulse</div>
                  <div className="text-gray-700">
                    Sentiment Pulse tracks market sentiment by analyzing news articles, social media, and financial reports. It provides real-time insights into positive, negative, or neutral market perceptions.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance dropdown */}
        <div className="mb-8 relative">
          <select
            value={filters.performance}
            onChange={(e) => updateFilter('performance', e.target.value)}
            className="w-full pl-3 pr-12 py-2 bg-black border border-gray-600 text-white rounded-lg text-sm appearance-none outline-none"
          >
            <option value="1-day" className="bg-black text-white">1-day performance</option>
            <option value="1-week" className="bg-black text-white">1-week performance</option>
            <option value="1-month" className="bg-black text-white">1-month performance</option>
            <option value="3-month" className="bg-black text-white">3-month performance</option>
            <option value="1-year" className="bg-black text-white">1-year performance</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sectors */}
      <div>
        <h3 className="text-base font-semibold text-[#686969] mb-4">Sectors:</h3>
        <div className="space-y-3">
          {[
            { key: 'energy', label: 'Energy & Renewable Energy' },
            { key: 'technology', label: 'Technology & Fintech' },
            { key: 'infrastructure', label: 'Infrastructure & Real Estate' },
            { key: 'agriculture', label: 'Agriculture & Agribusiness' },
            { key: 'manufacturing', label: 'Manufacturing & Industrialization' },
            { key: 'tourism', label: 'Tourism & Hospitality' },
            { key: 'financial', label: 'Financial Markets & Investment' },
            { key: 'healthcare', label: 'Healthcare & Pharmaceuticals' },
          ].map((sector) => (
            <label key={sector.key} className="flex items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.sectors[sector.key as keyof typeof filters.sectors]}
                  onChange={(e) => updateSector(sector.key, e.target.checked)}
                  className="h-4 w-4 appearance-none border-2 border-[#B0B2B2] rounded bg-transparent checked:bg-white checked:border-white  cursor-pointer transition-all"
                />
                {filters.sectors[sector.key as keyof typeof filters.sectors] && (
                  <svg className="absolute top-1 left-0.5 h-3 w-3 text-black pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="ml-3 text-sm text-[#B0B2B2] mb-0.5 cursor-pointer">{sector.label}</span>
            </label>
          ))}
        </div>
      </div>
        </div>
      )}
    </div>
  )
}
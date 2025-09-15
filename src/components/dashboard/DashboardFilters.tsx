'use client'

import { useState } from 'react'

interface DashboardFiltersProps {
  onFiltersChange: (filters: any) => void
}

export default function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
  const [filters, setFilters] = useState({
    whereToInvestISI: '',
    whenToInvestMETI: '',
    marketMood: '',
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

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const updateSector = (sector: string, checked: boolean) => {
    const newSectors = { ...filters.sectors, [sector]: checked }
    const newFilters = { ...filters, sectors: newSectors }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="bg-black border-r border-gray-700 w-80 p-6 overflow-y-auto hidden lg:block">
     

      {/* Map Filters */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-500 mb-4">Map Filters</h3>
        
        {/* Where to invest - ISI */}
        <div className="mb-6">
          <label className="flex items-center text-sm text-gray-300 mb-2">
            <span>Where to invest - ISI</span>
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </label>

        </div>

        {/* When to invest - METI */}
        <div className="mb-6">
          <label className="flex items-center text-sm text-gray-300 mb-2">
            <span>When to invest - METI</span>
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </label>
       
        </div>

        {/* Market mood */}
        <div className="mb-6">
          <label className="flex items-center text-sm text-gray-300 mb-2">
            <span>Market mood - Sentiment Pulse</span>
            <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </label>
         
        </div>

        {/* Performance dropdown */}
        <div className="mb-8 relative">
          <select
            value={filters.performance}
            onChange={(e) => updateFilter('performance', e.target.value)}
            className="w-full pl-3 pr-12 py-2 bg-black border-2 border-gray-600 text-white rounded-lg text-sm appearance-none [&>option]:bg-black [&>option]:text-white"
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
        <h3 className="text-base font-semibold text-gray-500 mb-4">Sectors:</h3>
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
                  className="h-4 w-4 appearance-none border-2 border-gray-600 rounded bg-transparent focus:ring-2 focus:ring-gray-500 focus:ring-offset-0"
                />
                {filters.sectors[sector.key as keyof typeof filters.sectors] && (
                  <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="h-3 w-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="ml-3 text-sm text-gray-300">{sector.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
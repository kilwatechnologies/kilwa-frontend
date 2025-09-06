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
        <div className="mb-8">
          <select
            value={filters.performance}
            onChange={(e) => updateFilter('performance', e.target.value)}
            className="w-full px-3 py-2 bg-transparent border-2 border-gray-600 text-white rounded-lg  text-sm"
          >
            <option value="1-day">1-day performance</option>
            <option value="1-week">1-week performance</option>
            <option value="1-month">1-month performance</option>
            <option value="3-month">3-month performance</option>
            <option value="1-year">1-year performance</option>
          </select>
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
              <input
                type="checkbox"
                checked={filters.sectors[sector.key as keyof typeof filters.sectors]}
                onChange={(e) => updateSector(sector.key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded bg-transparent"
              />
              <span className="ml-3 text-sm text-gray-300">{sector.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
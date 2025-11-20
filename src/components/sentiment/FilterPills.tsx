'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface Country {
  id: number
  name: string
  isoCode: string
}

interface FilterPillsProps {
  countries: Country[]
  selectedCountries: Country[]
  onCountryChange: (country: Country) => void
}

// Map country names to their flag SVG filenames
const countryFlagMap: { [key: string]: string } = {
  'Nigeria': 'nigeria.svg',
  'Kenya': 'kenya.svg',
  'South Africa': 'south-africa.svg',
  'Ghana': 'ghana.svg',
  'Egypt': 'egypt.svg',
  'Morocco': 'morocco.svg',
  'Tunisia': 'tunisia.svg',
  'Rwanda': 'rwanda.svg',
  'Botswana': 'botswana.svg',
  'Mauritius': 'mauritius.svg',
}

// Helper function to get flag image path from country name
const getFlagPath = (countryName: string): string => {
  return `/assets/${countryFlagMap[countryName] || 'nigeria.svg'}`
}

export default function FilterPills({
  countries,
  selectedCountries,
  onCountryChange
}: FilterPillsProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isSelected = (country: Country) => {
    return selectedCountries.some(c => c.id === country.id)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Label */}
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">Filter by Country:</span>
        </div>

        {/* Selected Countries Pills */}
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {selectedCountries.length > 0 ? (
            selectedCountries.map(country => (
              <div
                key={country.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
              >
                <Image
                  src={getFlagPath(country.name)}
                  alt={`${country.name} flag`}
                  width={20}
                  height={20}
                  className="rounded-sm"
                />
                <span>{country.name}</span>
                <button
                  onClick={() => onCountryChange(country)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${country.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500 italic">No country selected</span>
          )}
        </div>

        {/* Add Country Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium border border-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Select Countries
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-80">
              {/* Search */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search countries..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(country => {
                    const selected = isSelected(country)
                    return (
                      <button
                        key={country.id}
                        onClick={() => {
                          onCountryChange(country)
                          // Don't close dropdown to allow multiple selections
                          // setShowDropdown(false)
                          // setSearchTerm('')
                        }}
                        className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                          selected ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={getFlagPath(country.name)}
                            alt={`${country.name} flag`}
                            width={24}
                            height={24}
                            className="rounded-sm"
                          />
                          <span className={`text-sm ${selected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                            {country.name}
                          </span>
                        </div>
                        {selected && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No countries found
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="text-xs text-gray-600">
                  {selectedCountries.length} {selectedCountries.length === 1 ? 'country' : 'countries'} selected
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SentimentFiltersProps {
  onFiltersChange: (filters: any) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function SentimentFilters({ onFiltersChange, isCollapsed = false, onToggleCollapse }: SentimentFiltersProps) {
  const [filters, setFilters] = useState({
    sectors: {
      energy: false,
      technology: false,
      infrastructure: false,
      agriculture: false,
      manufacturing: false,
      tourism: false,
      financial: false,
      healthcare: false,
    },
    sources: {
      googleNews: true,
      rss: true,
    },
    socials: {
      twitter: false,
      instagram: false,
      youtube: false,
      weibo: false,
    },
    aiInsights: true
  })

  const [newsExpanded, setNewsExpanded] = useState(true)
  const [socialsExpanded, setSocialsExpanded] = useState(true)

  const updateSector = (sector: string, checked: boolean) => {
    const newSectors = { ...filters.sectors, [sector]: checked }
    const newFilters = { ...filters, sectors: newSectors }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const updateSource = (source: string, checked: boolean) => {
    const newSources = { ...filters.sources, [source]: checked }
    const newFilters = { ...filters, sources: newSources }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const updateSocial = (social: string, checked: boolean) => {
    const newSocials = { ...filters.socials, [social]: checked }
    const newFilters = { ...filters, socials: newSocials }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const toggleAI = (checked: boolean) => {
    const newFilters = { ...filters, aiInsights: checked }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className={`bg-black ${isCollapsed ? 'w-auto border-r-0' : 'w-80 border-r border-gray-700'} transition-all duration-300 overflow-y-auto hidden lg:block`}>
      {/* Collapsible Header */}
      {isCollapsed ? (
        // Collapsed state: rounded button with Filters text
        <div className="p-3 flex items-center justify-center">
          <button
            onClick={onToggleCollapse}
            className="bg-[#2a2a2a] rounded-lg px-3 py-3 cursor-pointer flex items-center gap-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] active:bg-[#2a2a2a] focus:outline-none"
            aria-label="Expand filters"
          >
            <Image
              src="/assets/flask.svg"
              alt="Filter"
              width={24}
              height={24}
              className="text-white"
            />
            <span className="text-white font-semibold text-base ">Filters</span>
            <Image
              src="/assets/filter.svg"
              alt="Expand"
              width={20}
              height={20}
              className="text-white"
            />
          </button>
        </div>
      ) : (
        // Expanded state: horizontal layout bar
        <button
          onClick={onToggleCollapse}
          className="mt-4   rounded-2xl px-5 py-4 cursor-pointer transition-colors flex items-center justify-between w-[calc(100%-2rem)]"
        >
          <div className="flex items-center gap-2">
            <Image
              src="/assets/flas-gray.svg"
              alt="Filter"
              width={24}
              height={24}
              className="text-[#B0B2B2]"
            />
            <span className="text-[#B0B2B2] font-normal text-medium">Filters</span>
          </div>
          <Image
            src="/assets/filter-gray.svg"
            alt="Collapse"
            width={20}
            height={20}
            className="text-white"
          />
        </button>
      )}

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-6 space-y-8">
          {/* Search */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-black border border-[#B0B2B2] text-white rounded-lg text-sm placeholder-[#B0B2B2] focus:outline-none focus:border-gray-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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
                      className="h-4 w-4 appearance-none border-2 border-[#B0B2B2] rounded bg-transparent checked:bg-white checked:border-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 cursor-pointer transition-all"
                    />
                    {filters.sectors[sector.key as keyof typeof filters.sectors] && (
                      <svg className="absolute top-1 left-0.5 h-3 w-3 text-black pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-[#B0B2B2]">{sector.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sources: News */}
          <div>
            <h3 className="text-base font-semibold text-[#686969] mb-4">Sources:</h3>

            {/* News Section */}
            <div className="mb-4">
              <button
                onClick={() => setNewsExpanded(!newsExpanded)}
                className="w-full flex items-center justify-between text-sm font-medium text-white mb-3 hover:text-gray-300 transition-colors"
              >
                <span>News</span>
                <svg
                  className={`w-4 h-4 transition-transform ${newsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {newsExpanded && (
                <div className="space-y-3">
                  {[
                    { key: 'googleNews', label: 'Google News' },
                    { key: 'rss', label: 'RSS Feeds' },
                  ].map((source) => (
                    <label key={source.key} className="flex items-center">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.sources[source.key as keyof typeof filters.sources]}
                          onChange={(e) => updateSource(source.key, e.target.checked)}
                          className="h-4 w-4 appearance-none border-2 border-[#B0B2B2] rounded bg-transparent checked:bg-white checked:border-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 cursor-pointer transition-all"
                        />
                        {filters.sources[source.key as keyof typeof filters.sources] && (
                          <svg className="absolute top-1 left-0.5 h-3 w-3 text-black pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="ml-3 text-sm text-[#B0B2B2]">{source.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Socials Section */}
            <div>
              <button
                onClick={() => setSocialsExpanded(!socialsExpanded)}
                className="w-full flex items-center justify-between text-sm font-medium text-white mb-3 hover:text-gray-300 transition-colors"
              >
                <span>Socials</span>
                <svg
                  className={`w-4 h-4 transition-transform ${socialsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {socialsExpanded && (
                <div className="space-y-3">
                  {[
                    { key: 'twitter', label: 'Twitter' },
                    { key: 'instagram', label: 'Instagram' },
                    { key: 'youtube', label: 'Youtube' },
                    { key: 'weibo', label: 'Weibo' },
                  ].map((social) => (
                    <label key={social.key} className="flex items-center">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.socials[social.key as keyof typeof filters.socials]}
                          onChange={(e) => updateSocial(social.key, e.target.checked)}
                          className="h-4 w-4 appearance-none border-2 border-[#B0B2B2] rounded bg-transparent checked:bg-white checked:border-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 cursor-pointer transition-all"
                        />
                        {filters.socials[social.key as keyof typeof filters.socials] && (
                          <svg className="absolute top-1 left-0.5 h-3 w-3 text-black pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="ml-3 text-sm text-[#B0B2B2]">{social.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI insights */}
          <div>
            <label className="flex items-center">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={filters.aiInsights}
                  onChange={(e) => toggleAI(e.target.checked)}
                  className="h-4 w-4 appearance-none border-2 border-[#B0B2B2] rounded bg-transparent checked:bg-white checked:border-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-0 cursor-pointer transition-all"
                />
                {filters.aiInsights && (
                  <svg className="absolute top-1 left-0.5 h-3 w-3 text-black pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="ml-3 text-sm text-white">Al insights</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

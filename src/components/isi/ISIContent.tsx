'use client'

import { useState } from 'react'

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

export default function ISIContent() {
  const [selectedCountry] = useState('Kenya')

  // Mock data
  const sectorData: SectorData[] = [
    { name: 'Energy & Renewable Energy', outlook: 'Favorable', focusMarkets: 'Solar, Hydro' },
    { name: 'Agriculture & Agribusiness', outlook: 'Favorable', focusMarkets: 'Cocoa, Tea' },
    { name: 'Technology & Fintech', outlook: 'Favorable', focusMarkets: 'Mobile Payments' },
    { name: 'Infrastructure & Real Estate', outlook: 'High-Risk', focusMarkets: 'Urban Housing' },
    { name: 'Manufacturing & Industrialization', outlook: 'Neutral', focusMarkets: 'Textiles, Packaging' },
    { name: 'Tourism & Hospitality', outlook: 'High-Risk', focusMarkets: 'Safari, Wellness' },
    { name: 'Financial Markets & Investment', outlook: 'Neutral', focusMarkets: 'Microfinance, PE' },
    { name: 'Healthcare & Pharmaceuticals', outlook: 'Neutral', focusMarkets: 'Generics' },
  ]

  const driverCategories: DriverCategoryData[] = [
    { name: 'Macroeconomic Stability', contribution: '+7.5', riskLevel: 'Critical' },
    { name: 'Business Environment', contribution: '+12.0', riskLevel: 'Moderate' },
    { name: 'Market Size & Demand', contribution: '+14.0', riskLevel: 'Moderate' },
    { name: 'Investment & Capital Market Data', contribution: '+16.5', riskLevel: 'Strong' },
    { name: 'Political & Economic Risks', contribution: '+8.0', riskLevel: 'Moderate' },
    { name: 'Industry & Sector Trends', contribution: '+14.0', riskLevel: 'Strong' },
  ]

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'Favorable': return 'text-green-600'
      case 'High-Risk': return 'text-red-600'
      case 'Neutral': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical': return 'bg-red-100 text-red-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Strong': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="bg-white text-black p-6">
      {/* Country Selector and Date */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-xs">🇰🇪</span>
          </div>
          <select 
            className="bg-transparent text-black rounded px-3 py-1"
            value={selectedCountry}
          >
            <option value="Kenya">Kenya</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <span>📅</span>
          <span>Sunday, 12 September, 2025</span>
        </div>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {/* ISI Score */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">ISI Score</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-black mb-2">Investment Grade</div>
                <div className="text-sm text-gray-600">Favorable</div>
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

        {/* Strategic Signal */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Strategic Signal</h3>
          </div>
          <div className="p-4">
            <div className="text-xl font-semibold text-black mb-2">Optimal Entry</div>
            <div className="text-sm text-gray-600 mb-2">High confidence</div>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              Neutral
            </div>
          </div>
        </div>

        {/* Sentiment Pulse */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Sentiment Pulse</h3>
          </div>
          <div className="p-4">
            <div className="text-xl font-semibold text-black mb-2">Positive</div>
            <div className="text-sm text-gray-600 mb-2">Based on last 30 days</div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600">Upward</span>
              <span className="text-green-600">📈</span>
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
              <span className="text-lg font-semibold text-black">2 Critical / 3 New</span>
            </div>
            <div className="text-sm text-gray-600">ISI dropped below 50 in Kenya</div>
          </div>
        </div>
      </div>

      {/* Main Content - Flexible Layout */}
      <div className="flex gap-6">
        {/* Left Side - Chart and Sectors */}
        <div className="flex-1 space-y-6">
          {/* Chart Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">ISI Trend Analysis</h3>
            </div>
            <div className="p-4">
              {/* Time Period Selector */}
              <div className="flex space-x-2 mb-4">
                {['1 D', '5 D', '1 M', '3 M', '6 M', 'YTD', '1 Y', '5 Y', '10 Y'].map((period) => (
                  <button
                    key={period}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-black rounded"
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-sm">Technology & Fintech</span>
                </div>
              </div>

              {/* Mock Chart Area with Data Point */}
              <div className="h-80 bg-gray-50 rounded relative">
                <div className="absolute top-4 right-4 bg-white border rounded p-2 text-xs">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Technology & Fintech 03/05/25</span>
                  </div>
                  <div>ISI Score: <strong>87</strong></div>
                  <div>Status: <span className="text-green-600">Optimal</span></div>
                  <div>Change: <span className="text-green-600">+1.21%</span></div>
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

                {/* Mock chart line */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500">ISI Score Chart Visualization</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sectors Section */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">Sector Analysis</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
                <span>Sector</span>
                <span>Zawadi AI Outlook</span>
                <span>Focus Markets</span>
              </div>
              
              {sectorData.map((sector, index) => (
                <div key={index} className={`grid grid-cols-3 gap-4 items-center py-3 ${index !== sectorData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" defaultChecked={index < 3} />
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
        <div className="w-80 flex flex-col gap-6">
          {/* Driver Categories */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">Driver Category</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
                <span></span>
                <span>Contribution</span>
                <span>Risk Level</span>
              </div>
              
              {driverCategories.map((category, index) => (
                <div key={index} className={`grid grid-cols-3 gap-4 items-center py-2 ${index !== driverCategories.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-sm text-black">{category.name}</span>
                  <span className="text-sm text-black">{category.contribution}</span>
                  <div className="flex items-center space-x-2">
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
                        Nigeria's economic indicators show mixed signals with inflation remaining elevated at 24.08% y/y 
                        but showing signs of deceleration. The CBN has maintained a hawkish stance with rates at 26.75%, 
                        supporting the naira's stability in recent months.
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
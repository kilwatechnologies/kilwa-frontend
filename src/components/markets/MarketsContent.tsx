'use client'

import { useState } from 'react'

interface NewsItem {
  title: string
  source: string
  category: string
  time: string
}

interface EquityFactor {
  name: string
  value: string
  core: string
  growth: string
}

interface SectorETF {
  name: string
  value: string
  forecast: string
  change: string
}

interface GovernanceIndicator {
  name: string
  value: number
  forecast: number
  change: string
}

export default function MarketsContent() {
  const [selectedCountry] = useState('Kenya')
  const [, setSelectedTab] = useState('overview')

  // Mock data based on the design
  const macroeconomicData = [
    { metric: 'GDP (current KES)', value: '$114.9B', forecast: '$118.3B', change: '+1.21%' },
    { metric: 'GDP per capita', value: '$2,150', forecast: '$2,310', change: '+1.21%' },
    { metric: 'GDP growth (annual %)', value: '5.1%', forecast: '5.6%', change: '+1.21%' },
    { metric: 'Inflation rate (CPI, %)', value: '7.8%', forecast: '6.4%', change: '-2.31%' },
  ]

  const currencies = [
    { pair: 'USD/KES', price: '114.9', change: '+1.21%' },
    { pair: 'EUR/KES', price: '124', change: '+1.21%' },
    { pair: 'GBP/KES', price: '145', change: '+1.21%' },
    { pair: 'JPY/KES', price: '1.0', change: '-2.31%' },
  ]

  const financeData = [
    { metric: 'Debt stock (% of GNI)', value: '$114.9B', forecast: '$118.3B', change: '+1.21%', icon: '🔵' },
    { metric: 'FDI net inflows (KES)', value: '$2,150', forecast: '$2,310', change: '+1.21%', icon: '🟠' },
    { metric: 'Current balance (% GDP)', value: '5.1%', forecast: '5.6%', change: '-2.31%' },
    { metric: 'Domestic credit to private sector (% of GDP)', value: '$114.9B', forecast: '$114.9B', change: '-2.31%' },
    { metric: 'Depth of capital markets (Market cap / GDP)', value: '5.1%', forecast: '5.1%', change: '+1.21%' },
  ]

  const marketNews: NewsItem[] = [
    {
      title: 'Safaricom Reports Record Q3 Profits as Mobile Money Growth Accelerates',
      source: 'Business Daily',
      category: 'Markets',
      time: '9:59 AM'
    },
    {
      title: 'Central Bank of Kenya Maintains Benchmark Rate at 12.75% Amid Inflation',
      source: 'Business Daily',
      category: 'Energy',
      time: '9:59 AM'
    },
    {
      title: 'KenGen Secures $450M Financing for Renewable Energy Projects Expansion',
      source: 'Business Daily',
      category: 'Energy',
      time: '9:59 AM'
    },
    {
      title: 'NSE 20-Share Index Gains 2.1% on Banking Sector Rally',
      source: 'Market Watch',
      category: 'Kenya',
      time: '8:59 AM'
    },
    {
      title: 'NSE 20-Share Index Gains 2.1% on Banking Sector Rally',
      source: 'Market Watch',
      category: 'Kenya',
      time: '9:59 AM'
    },
  ]

  const equityFactors: EquityFactor[] = [
    { name: 'Large', value: '-0.1%', core: '-0.3%', growth: '-0.4%' },
    { name: 'Mid', value: '-0.3%', core: '-0.4%', growth: '-0.5%' },
    { name: 'Small', value: '-0.4%', core: '-0.4%', growth: '-0.3%' },
  ]

  const sectorETFs: SectorETF[] = [
    { name: 'Energy & Renewable Energy', value: '$114.9B', forecast: '$118.3B', change: '+1.21%' },
    { name: 'Technology & Fintech', value: '$2,150', forecast: '$2,310', change: '+1.21%' },
    { name: 'Infrastructure & Real Estate', value: '5.1%', forecast: '5.6%', change: '+1.21%' },
    { name: 'Manufacturing & Industrialization', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Agriculture & Agribusiness', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Tourism & Hospitality', value: '7.8%', forecast: '6.4%', change: '+1.21%' },
    { name: 'Financial Markets & Investment', value: '7.8%', forecast: '6.4%', change: '-2.31%' },
  ]

  const governanceIndicators: GovernanceIndicator[] = [
    { name: 'Voice & Accountability', value: 43.2, forecast: 49, change: '+1.9%' },
    { name: 'Absence of Violence', value: 38.7, forecast: 40.5, change: '+1.6%' },
    { name: 'Government Effectiveness', value: 48.6, forecast: 49, change: '+0.6%' },
    { name: 'Regulatory Quality', value: 52.4, forecast: 55.6, change: '+0.7%' },
    { name: 'Rule of Law', value: 41.8, forecast: 42.8, change: '+0.8%' },
    { name: 'Control of Corruption', value: 39.5, forecast: 41.2, change: '-3.1%' },
    { name: 'Political Stability Rating', value: 0, forecast: 0, change: '-3.1%' },
  ]

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-500'
    if (change.startsWith('-')) return 'text-red-500'
    return 'text-gray-400'
  }

  const getChangeBackground = (change: string) => {
    if (change.startsWith('+')) return 'bg-green-500/10'
    if (change.startsWith('-')) return 'bg-red-500/10'
    return 'bg-gray-500/10'
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

      {/* Top Row - Macroeconomic, Currencies, Finance */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Macroeconomic Overview */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Macroeconomic Overview</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>Metric</span>
              <span>Value</span>
              <span>Forecast</span>
              <span>%</span>
            </div>
            {macroeconomicData.map((item, index) => (
              <div key={index} className={`grid grid-cols-4 gap-4 items-center py-2 ${index !== macroeconomicData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black">{item.metric}</span>
                </div>
                <span className="text-sm text-black">{item.value}</span>
                <span className="text-sm text-black">{item.forecast}</span>
                <span className={`text-sm ${getChangeColor(item.change)}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Currencies */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Currencies</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>Pair</span>
              <span>Price</span>
              <span>%</span>
            </div>
            {currencies.map((currency, index) => (
              <div key={index} className={`grid grid-cols-3 gap-4 items-center py-2 ${index !== currencies.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-sm text-black">{currency.pair}</span>
                <span className="text-sm text-black">{currency.price}</span>
                <span className={`text-sm ${getChangeColor(currency.change)}`}>
                  {currency.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Finance</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>External Finance</span>
              <span>Value</span>
              <span>Forecast</span>
              <span>%</span>
            </div>
            {financeData.map((item, index) => (
              <div key={index} className={`grid grid-cols-4 gap-4 items-center py-2 ${index !== financeData.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black">{item.metric}</span>
                </div>
                <span className="text-sm text-black">{item.value}</span>
                <span className="text-sm text-black">{item.forecast}</span>
                <span className={`text-sm ${getChangeColor(item.change)}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row - Chart and Market News */}
      <div className="flex gap-6 mb-6">
        {/* Chart Component - Custom width */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '67%' }}>
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Macroeconomic Overview</h3>
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
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-black">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Inflation rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>GDP growth (KES)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>FDI net inflows</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span>Debt stock</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded"></div>
                <span>Energy & renewable</span>
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center relative">
              <div className="absolute top-4 left-4 text-right">
                <div className="text-sm text-gray-600">+200%</div>
                <div className="text-sm text-gray-600">+000%</div>
                <div className="text-sm text-gray-600">-200%</div>
                <div className="text-sm text-gray-600">+000%</div>
                <div className="text-sm text-gray-600">-600%</div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-between text-xs text-gray-600 px-8">
                <span>8/17</span>
                <span>8/18</span>
                <span>8/19</span>
                <span>8/20</span>
                <span>8/21</span>
              </div>
              <span className="text-gray-500">Chart visualization would go here</span>
            </div>
          </div>
        </div>

        {/* Market News - Custom width */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ width: '33%' }}>
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Market News</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {marketNews.map((news, index) => (
                <div key={index} className={`pb-3 ${index !== marketNews.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <h4 className="text-sm font-medium mb-1 text-black">{news.title}</h4>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{news.source} &gt; {news.category}</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        
        {/* Governance & Risk */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Governance & Risk</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>Indicator</span>
              <span>Value</span>
              <span>Forecast</span>
              <span>%</span>
            </div>
            {governanceIndicators.map((indicator, index) => (
              <div key={index} className={`grid grid-cols-4 gap-4 items-center py-2 ${index !== governanceIndicators.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="text-sm text-black">{indicator.name}</span>
                <span className="text-sm text-black">{indicator.value}</span>
                <span className="text-sm text-black">{indicator.forecast}</span>
                <span className={`text-sm ${getChangeColor(indicator.change)}`}>
                  {indicator.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Equity Factors */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Equity Factors</h3>
          </div>
          <div className="p-4">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-3">1-Day Performance</div>
            
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div></div>
              <div className="text-center text-xs text-gray-600 font-medium">Value</div>
              <div className="text-center text-xs text-gray-600 font-medium">Core</div>
              <div className="text-center text-xs text-gray-600 font-medium">Growth</div>
            </div>
            
            {/* Data Rows */}
            {equityFactors.map((factor, index) => (
              <div key={index} className="grid grid-cols-4 gap-3 mb-6">
                <div className="flex items-center text-sm text-black font-medium">{factor.name}</div>
                
                {/* Value Box */}
                <div className="bg-red-100 border border-red-200 rounded-md py-6 px-3 text-center">
                  <span className="text-sm font-medium text-red-800">{factor.value}</span>
                </div>
                
                {/* Core Box */}
                <div className={`${index === 1 ? 'bg-blue-100 border-blue-300 border-2' : 'bg-red-100 border border-red-200'} rounded-md py-6 px-3 text-center`}>
                  <span className={`text-sm font-medium ${index === 1 ? 'text-blue-800' : 'text-red-800'}`}>
                    {factor.core}
                  </span>
                </div>
                
                {/* Growth Box */}
                <div className="bg-red-100 border border-red-200 rounded-md py-6 px-3 text-center">
                  <span className="text-sm font-medium text-red-800">{factor.growth}</span>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Equity Sectors */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Equity Sectors</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 mb-3 pb-2 border-b border-gray-100">
              <span>S&P Sector ETFs</span>
              <span>Value</span>
              <span>Forecast</span>
              <span>%</span>
            </div>
            {sectorETFs.map((sector, index) => (
              <div key={index} className={`grid grid-cols-4 gap-4 items-center py-2 ${index !== sectorETFs.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black">{sector.name}</span>
                </div>
                <span className="text-sm text-black">{sector.value}</span>
                <span className="text-sm text-black">{sector.forecast}</span>
                <span className={`text-sm ${getChangeColor(sector.change)}`}>
                  {sector.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
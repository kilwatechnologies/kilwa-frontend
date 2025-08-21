'use client';

import { useState } from 'react';
import { ScoreOverview } from '@/components/dashboard/ScoreOverview';
import { CountryRankings } from '@/components/dashboard/CountryRankings';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateYearOptions } from '@/lib/utils';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedCountry, setSelectedCountry] = useState<number | undefined>(undefined);

  const yearOptions = generateYearOptions(2010);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kilwa Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Sovereign Risk Intelligence for African Markets
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                Year:
              </label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
            
            <Button variant="primary" size="sm">
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Countries Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">10</p>
              </div>
              <div className="ml-4 text-2xl">🌍</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Data Sources</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
              <div className="ml-4 text-2xl">📊</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">KPI Categories</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
              <div className="ml-4 text-2xl">📈</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="ml-4 text-2xl">⏰</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Overview - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <ScoreOverview year={selectedYear} countryId={selectedCountry} />
        </div>
        
        {/* Country Rankings - Takes up 1 column */}
        <div>
          <CountryRankings year={selectedYear} limit={10} />
        </div>
      </div>

      {/* Additional Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About ISI</CardTitle>
            <CardDescription>
              Investment Suitability Index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The ISI evaluates investment potential across six key categories:
              Macroeconomic Stability (25%), Business Environment (20%), 
              Market Size & Demand (15%), Industry & Sector Trends (15%), 
              Political & Economic Risks (15%), and Investment & Capital Markets (10%).
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About METI</CardTitle>
            <CardDescription>
              Market Entry Timing Indicator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              METI analyzes optimal timing for market entry by evaluating current 
              economic conditions, growth trends, and market dynamics to identify 
              the best windows of opportunity for investment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
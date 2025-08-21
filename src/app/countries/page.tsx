'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CountryRankings } from '@/components/dashboard/CountryRankings';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { generateYearOptions, getCountryFlag } from '@/lib/utils';

// Mock data - replace with real API calls
const countries = [
  { id: 1, name: 'Nigeria', isoCode: 'NGA', isiScore: 72.4, metiScore: 68.9 },
  { id: 2, name: 'Kenya', isoCode: 'KEN', isiScore: 69.8, metiScore: 71.2 },
  { id: 3, name: 'Ghana', isoCode: 'GHA', isiScore: 67.3, metiScore: 65.7 },
  { id: 4, name: 'Rwanda', isoCode: 'RWA', isiScore: 75.1, metiScore: 73.8 },
  { id: 5, name: 'South Africa', isoCode: 'ZAF', isiScore: 64.2, metiScore: 62.1 },
];

export default function CountriesPage() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const yearOptions = generateYearOptions(2015);
  // Mock historical data for selected country
  const historicalData = [
    { name: '2019', score: selectedCountry.isiScore - 5 },
    { name: '2020', score: selectedCountry.isiScore - 3 },
    { name: '2021', score: selectedCountry.isiScore - 1 },
    { name: '2022', score: selectedCountry.isiScore + 1 },
    { name: '2023', score: selectedCountry.isiScore },
  ];

  const categoryBreakdown = [
    { name: 'Macroeconomic Stability', score: 75 },
    { name: 'Business Environment', score: 68 },
    { name: 'Market Size & Demand', score: 82 },
    { name: 'Industry & Sector', score: 71 },
    { name: 'Political & Economic Risk', score: 59 },
    { name: 'Investment & Capital', score: 77 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Country Analysis</h1>
            <p className="text-gray-600 mt-1">
              Detailed investment suitability analysis by country
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
            <Button variant="primary" size="sm">
              Export Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Country Selection and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select Country</CardTitle>
              <CardDescription>Choose a country for detailed analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {countries.map((country) => (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountry(country)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCountry.id === country.id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getCountryFlag(country.isoCode)}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {country.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {country.isoCode}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600">
                          ISI: {country.isiScore}
                        </div>
                        <div className="text-sm text-gray-500">
                          METI: {country.metiScore}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Country Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Country Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <span className="text-4xl">
                  {getCountryFlag(selectedCountry.isoCode)}
                </span>
                <div>
                  <CardTitle className="text-xl">
                    {selectedCountry.name} Analysis
                  </CardTitle>
                  <CardDescription>
                    Investment suitability metrics for {selectedYear}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedCountry.isiScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Investment Suitability Index
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {selectedCountry.metiScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Market Entry Timing Indicator
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Historical ISI Trends</CardTitle>
              <CardDescription>
                Investment suitability trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreChart 
                data={historicalData}
                type="line"
                height={300}
              />
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Detailed score analysis by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreChart 
                data={categoryBreakdown}
                type="bar"
                height={300}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Country Rankings */}
      <CountryRankings year={selectedYear} limit={15} />
    </div>
  );
}
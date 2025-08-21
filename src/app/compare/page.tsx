'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { generateYearOptions, getCountryFlag, formatScore } from '@/lib/utils';

// Mock data
const countries = [
  { id: 1, name: 'Nigeria', isoCode: 'NGA' },
  { id: 2, name: 'Kenya', isoCode: 'KEN' },
  { id: 3, name: 'Ghana', isoCode: 'GHA' },
  { id: 4, name: 'Rwanda', isoCode: 'RWA' },
  { id: 5, name: 'South Africa', isoCode: 'ZAF' },
  { id: 6, name: 'Ethiopia', isoCode: 'ETH' },
  { id: 7, name: 'Morocco', isoCode: 'MAR' },
  { id: 8, name: 'Egypt', isoCode: 'EGY' },
];

export default function ComparePage() {
  const [selectedCountries, setSelectedCountries] = useState([countries[0], countries[1]]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [comparisonType, setComparisonType] = useState<'isi' | 'meti' | 'categories'>('isi');

  const yearOptions = generateYearOptions(2015);

  const handleCountryToggle = (country: typeof countries[0]) => {
    if (selectedCountries.find(c => c.id === country.id)) {
      if (selectedCountries.length > 1) {
        setSelectedCountries(prev => prev.filter(c => c.id !== country.id));
      }
    } else if (selectedCountries.length < 4) {
      setSelectedCountries(prev => [...prev, country]);
    }
  };

  // Mock comparison data
  const getComparisonData = () => {
    const mockScores = {
      1: { isi: 72.4, meti: 68.9, categories: [75, 68, 82, 71, 59, 77] },
      2: { isi: 69.8, meti: 71.2, categories: [70, 73, 75, 68, 65, 72] },
      3: { isi: 67.3, meti: 65.7, categories: [65, 70, 68, 72, 60, 69] },
      4: { isi: 75.1, meti: 73.8, categories: [80, 78, 65, 75, 80, 72] },
      5: { isi: 64.2, meti: 62.1, categories: [62, 65, 85, 60, 45, 68] },
      6: { isi: 58.9, meti: 61.4, categories: [55, 60, 70, 65, 50, 55] },
      7: { isi: 71.2, meti: 69.8, categories: [73, 75, 70, 68, 70, 71] },
      8: { isi: 63.7, meti: 66.2, categories: [60, 68, 78, 62, 55, 65] },
    };

    if (comparisonType === 'categories') {
      const categories = [
        'Macroeconomic Stability',
        'Business Environment', 
        'Market Size & Demand',
        'Industry & Sector',
        'Political Risk',
        'Capital Markets'
      ];
      
      return categories.map((category, index) => ({
        name: category,
        ...selectedCountries.reduce((acc, country, i) => {
          acc[country.name] = mockScores[country.id as keyof typeof mockScores]?.categories[index] || 0;
          return acc;
        }, {} as any)
      }));
    }

    return selectedCountries.map(country => ({
      name: country.name,
      score: mockScores[country.id as keyof typeof mockScores]?.[comparisonType] || 0,
      flag: getCountryFlag(country.isoCode)
    }));
  };

  const comparisonData = getComparisonData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Country Comparison</h1>
            <p className="text-gray-600 mt-1">
              Compare investment metrics across African countries
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
              Export Comparison
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Country Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Select Countries</CardTitle>
              <CardDescription>
                Choose 2-4 countries to compare (max 4)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {countries.map((country) => {
                  const isSelected = selectedCountries.find(c => c.id === country.id);
                  const isDisabled = !isSelected && selectedCountries.length >= 4;
                  
                  return (
                    <button
                      key={country.id}
                      onClick={() => handleCountryToggle(country)}
                      disabled={isDisabled}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-2 border-blue-200'
                          : isDisabled
                          ? 'bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
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
                        {isSelected && (
                          <div className="ml-auto">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                {selectedCountries.length}/4 countries selected
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Selected Countries Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {selectedCountries.map((country) => (
                  <div
                    key={country.id}
                    className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg"
                  >
                    <span className="text-xl">
                      {getCountryFlag(country.isoCode)}
                    </span>
                    <span className="font-medium text-gray-900">
                      {country.name}
                    </span>
                    <button
                      onClick={() => handleCountryToggle(country)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      disabled={selectedCountries.length <= 1}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Comparison Analysis</CardTitle>
                  <CardDescription>
                    {comparisonType === 'isi' && 'Investment Suitability Index comparison'}
                    {comparisonType === 'meti' && 'Market Entry Timing Indicator comparison'}
                    {comparisonType === 'categories' && 'Category-wise comparison'}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-1">
                  {(['isi', 'meti', 'categories'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setComparisonType(type)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        comparisonType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScoreChart 
                data={comparisonData}
                type={comparisonType === 'categories' ? 'bar' : 'bar'}
                height={400}
              />
            </CardContent>
          </Card>

          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>
                Numerical comparison of key indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ISI Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        METI Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedCountries.map((country, index) => (
                      <tr key={country.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">
                              {getCountryFlag(country.isoCode)}
                            </span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {country.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {country.isoCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatScore(72.4 - index * 3)} {/* Mock data */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatScore(68.9 + index * 1.5)} {/* Mock data */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            #{index + 1}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
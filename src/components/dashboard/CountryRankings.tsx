'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { isiApi } from '@/lib/api';
import { formatScore, getScoreColor, getCountryFlag } from '@/lib/utils';

interface CountryRankingsProps {
  year?: number;
  limit?: number;
}

interface CountryRankingData {
  countryId: number;
  countryName: string;
  isoCode: string;
  isiScore: number;
  metiScore: number;
  rank: number;
}

export function CountryRankings({ year = new Date().getFullYear(), limit = 10 }: CountryRankingsProps) {
  const [rankings, setRankings] = useState<CountryRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();
  }, [year]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the unified backend's rankings endpoint which combines ISI and METI
      const rankingsResponse = await isiApi.getRankings(year);
      const rankingsData = rankingsResponse.data.data;

      // Convert to our component's expected format
      const formattedRankings: CountryRankingData[] = rankingsData.map((ranking) => ({
        countryId: ranking.countryId,
        countryName: ranking.countryName,
        isoCode: ranking.isoCode,
        isiScore: ranking.isiScore,
        metiScore: ranking.metiScore,
        rank: ranking.rank
      }));

      setRankings(formattedRankings.slice(0, limit));
    } catch (err) {
      setError('Failed to load country rankings');
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Country Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Suitability Rankings {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankings.map((country) => (
            <div
              key={country.countryId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-lg font-bold text-gray-600">
                    #{country.rank}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {getCountryFlag(country.isoCode)}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {country.countryName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {country.isoCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(country.isiScore)}`}>
                    {formatScore(country.isiScore)}
                  </div>
                </div>
                
                <div className="text-right min-w-[60px]">
                  <div className="text-sm font-medium text-gray-900">
                    METI: {formatScore(country.metiScore)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rankings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No ranking data available for {year}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
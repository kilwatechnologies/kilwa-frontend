'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ScoreChart } from '@/components/charts/ScoreChart';
import { LoadingCard } from '@/components/ui/LoadingSpinner';
import { isiApi, metiApi } from '@/lib/api';
import { ISIScore, METIScore } from '@/lib/types';
import { formatScore, getCategoryDisplayName } from '@/lib/utils';

interface ScoreOverviewProps {
  countryId?: number;
  year?: number;
  showComparison?: boolean;
}

interface CategoryBreakdown {
  name: string;
  score: number;
  weight: number;
  contribution: number;
}

export function ScoreOverview({ 
  countryId, 
  year = new Date().getFullYear(),
  showComparison = false 
}: ScoreOverviewProps) {
  const [isiScores, setIsiScores] = useState<ISIScore[]>([]);
  const [metiScores, setMetiScores] = useState<METIScore[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'isi' | 'meti' | 'categories'>('isi');

  useEffect(() => {
    fetchScoreData();
  }, [countryId, year]);

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare countries filter if specific country is selected
      const countryFilter = countryId ? [countryId.toString()] : undefined;

      const [isiResponse, metiResponse] = await Promise.all([
        isiApi.getScores(year, countryFilter),
        metiApi.getScores(year, countryFilter),
      ]);

      // Check if responses are successful
      if (!isiResponse.data.success) {
        throw new Error(isiResponse.data.message || 'Failed to fetch ISI scores');
      }
      if (!metiResponse.data.success) {
        throw new Error(metiResponse.data.message || 'Failed to fetch METI scores');
      }

      setIsiScores(isiResponse.data.data || []);
      setMetiScores(metiResponse.data.data || []);

      // Calculate category breakdown from ISI scores if available
      if (isiResponse.data.data && isiResponse.data.data.length > 0) {
        // For now using mock data, but this could be enhanced with real category API
        setCategoryData([
          { name: 'Macroeconomic Stability', score: 75, weight: 0.25, contribution: 18.75 },
          { name: 'Business Environment', score: 68, weight: 0.20, contribution: 13.6 },
          { name: 'Market Size & Demand', score: 82, weight: 0.15, contribution: 12.3 },
          { name: 'Industry & Sector Trends', score: 71, weight: 0.15, contribution: 10.65 },
          { name: 'Political & Economic Risks', score: 59, weight: 0.15, contribution: 8.85 },
          { name: 'Investment & Capital Markets', score: 77, weight: 0.10, contribution: 7.7 },
        ]);
      } else {
        setCategoryData([]);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load score data');
      console.error('Error fetching score data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingCard title="Loading Scores" description="Fetching ISI and METI data..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgIsiScore = isiScores.reduce((sum, score) => sum + score.score, 0) / isiScores.length || 0;
  const avgMetiScore = metiScores.reduce((sum, score) => sum + score.score, 0) / metiScores.length || 0;

  const getChartData = () => {
    switch (selectedMetric) {
      case 'isi':
        return isiScores.map(score => ({
          name: score.country.name,
          score: score.score,
        }));
      case 'meti':
        return metiScores.map(score => ({
          name: score.country.name,
          score: score.score,
        }));
      case 'categories':
        return categoryData.map(cat => ({
          name: cat.name,
          score: cat.score,
          weight: cat.weight,
        }));
      default:
        return [];
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summary Cards */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">
              {formatScore(avgIsiScore)}
            </CardTitle>
            <CardDescription>
              Investment Suitability Index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Based on {isiScores.length} countries for {year}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">
              {formatScore(avgMetiScore)}
            </CardTitle>
            <CardDescription>
              Market Entry Timing Indicator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Based on {metiScores.length} countries for {year}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">ISI Scores</span>
                <span className="text-sm font-medium">{isiScores.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">METI Scores</span>
                <span className="text-sm font-medium">{metiScores.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Visualization */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Score Analysis</CardTitle>
              <div className="flex space-x-1">
                {(['isi', 'meti', 'categories'] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedMetric === metric
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {metric.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <CardDescription>
              {selectedMetric === 'isi' && 'Investment Suitability Index scores'}
              {selectedMetric === 'meti' && 'Market Entry Timing Indicator scores'}
              {selectedMetric === 'categories' && 'Category breakdown analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreChart 
              data={getChartData()}
              type={selectedMetric === 'categories' ? 'pie' : 'bar'}
              height={400}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
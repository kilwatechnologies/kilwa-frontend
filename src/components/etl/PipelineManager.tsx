'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { etlApi } from '@/lib/api';
import { PipelineStatus, ETLJob } from '@/lib/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { PlayIcon, StopIcon, ClockIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function PipelineManager() {
  const [pipelines, setPipelines] = useState<PipelineStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJobs, setRunningJobs] = useState<{ [key: string]: boolean }>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchPipelineStatus();
    const interval = setInterval(fetchPipelineStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPipelineStatus = async () => {
    try {
      const response = await etlApi.getStatus();
      setPipelines(response.data.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch pipeline status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async (pipelineName: string) => {
    try {
      setRunningJobs(prev => ({ ...prev, [pipelineName]: true }));
      await etlApi.runPipeline(pipelineName);
      await fetchPipelineStatus(); // Refresh status
    } catch (error) {
      console.error(`Failed to run pipeline ${pipelineName}:`, error);
    } finally {
      setRunningJobs(prev => ({ ...prev, [pipelineName]: false }));
    }
  };

  const runAllPipelines = async () => {
    try {
      setRunningJobs(prev => ({ ...prev, 'all': true }));
      await etlApi.runAllPipelines();
      await fetchPipelineStatus();
    } catch (error) {
      console.error('Failed to run all pipelines:', error);
    } finally {
      setRunningJobs(prev => ({ ...prev, 'all': false }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <LoadingSpinner size="sm" />;
      case 'completed':
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XMarkIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPipelineDisplayName = (pipeline: string) => {
    return pipeline
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(' Pipeline', '');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ETL Pipeline Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>ETL Pipeline Manager</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {formatDate(lastUpdate)}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPipelineStatus}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={runAllPipelines}
                loading={runningJobs['all']}
              >
                Run All Pipelines
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Pipeline Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.pipeline}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {getPipelineDisplayName(pipeline.pipeline)}
                  </CardTitle>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(pipeline.status)}`}>
                    {getStatusIcon(pipeline.status)}
                    <span className="ml-1 capitalize">{pipeline.status}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => runPipeline(pipeline.pipeline)}
                  loading={runningJobs[pipeline.pipeline]}
                  disabled={pipeline.status === 'running'}
                >
                  <PlayIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Run:</span>
                  <span>{formatDate(pipeline.lastRun)}</span>
                </div>
                {pipeline.nextRun && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Run:</span>
                    <span>{formatDate(pipeline.nextRun)}</span>
                  </div>
                )}
                {pipeline.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span>{pipeline.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pipeline.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {pipeline.message && (
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                    {pipeline.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pipelines.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No pipeline information available
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
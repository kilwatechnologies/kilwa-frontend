'use client';

import { PipelineManager } from '@/components/etl/PipelineManager';

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">ETL Pipeline Management</h1>
        <p className="text-gray-600 mt-1">
          Monitor and control data extraction, transformation, and loading processes
        </p>
      </div>

      <PipelineManager />
    </div>
  );
}
// ISI/METI Data Types
export interface Country {
  id: number;
  name: string;
  isoCode: string;
}

export interface KPICategory {
  id: number;
  name: string;
  weight: number;
}

export interface KPI {
  id: number;
  name: string;
  code: string;
  unit: string;
  isInverse: boolean;
  source: string;
  updateFrequency: string;
  categoryId: number;
}

export interface IndicatorData {
  id: number;
  countryId: number;
  kpiId: number;
  year: number;
  rawValue: number | null;
  normalizedValue: number | null;
  country: Country;
  kpi: KPI;
}

export interface ISIScore {
  id: number;
  countryId: number;
  year: number;
  score: number;
  country: Country;
  createdAt: string;
}

export interface METIScore {
  id: number;
  countryId: number;
  year: number;
  score: number;
  trendScore: number;
  volatilityScore: number;
  momentumScore: number;
  entryRecommendation: string;
  confidenceLevel: number;
  country: Country;
  createdAt: string;
}

export interface CategoryScore {
  category: string;
  score: number;
  weight: number;
  kpiScores: {
    kpiName: string;
    rawValue: number;
    normalizedValue: number;
    weight: number;
    contribution: number;
  }[];
}

export interface ISICalculationResult {
  countryId: number;
  year: number;
  score: number;
  categoryScores: CategoryScore[];
  metadata: {
    calculatedAt: Date;
    dataCompleteness: number;
    missingIndicators?: string[];
  };
}

// ETL Pipeline Types
export interface PipelineStatus {
  pipeline: string;
  status: 'running' | 'completed' | 'failed' | 'idle';
  lastRun: string;
  nextRun?: string;
  progress?: number;
  message?: string;
}

export interface ETLJob {
  id: string;
  name: string;
  description: string;
  status: PipelineStatus['status'];
  startTime?: string;
  endTime?: string;
  duration?: number;
  recordsProcessed?: number;
  errors?: string[];
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface CountryRanking {
  countryId: number;
  countryName: string;
  isoCode: string;
  isiScore: number;
  metiScore: number;
  rank: number;
  change: number; // Change from previous period
  flag?: string;
}

export interface TrendData {
  year: number;
  value: number;
  countryId?: number;
  category?: string;
}

export interface ComparisonData {
  countries: Country[];
  categories: {
    name: string;
    scores: { countryId: number; score: number; }[];
  }[];
  year: number;
}
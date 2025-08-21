import axios from 'axios';
import { 
  APIResponse, 
  Country, 
  ISIScore, 
  METIScore, 
  IndicatorData, 
  CountryRanking, 
  PipelineStatus, 
  ETLJob,
  ISICalculationResult 
} from './types';

// Configure axios - Updated for unified Python backend
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for data-heavy requests
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Countries API
export const countriesApi = {
  getAll: () => api.get<APIResponse<Country[]>>('/countries'),
  getById: (id: number) => api.get<APIResponse<Country>>(`/countries/${id}`),
  getAfricanCountries: () => api.get<APIResponse<Country[]>>('/countries?region=africa'),
};

// ISI Scores API - Updated for unified backend
export const isiApi = {
  getScores: (year?: number, countries?: string[]) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (countries?.length) params.append('countries', countries.join(','));
    return api.get<APIResponse<ISIScore[]>>(`/isi/scores?${params.toString()}`);
  },
  
  getScoresByCountry: (countryId: number, startYear?: number, endYear?: number) => {
    const params = new URLSearchParams();
    if (startYear) params.append('start_year', startYear.toString());
    if (endYear) params.append('end_year', endYear.toString());
    return api.get<APIResponse<ISIScore[]>>(`/isi/scores/country/${countryId}?${params.toString()}`);
  },
  
  calculateISI: (countryId: number, year: number) => 
    api.post<APIResponse<ISICalculationResult>>('/isi/calculate', { countryId, year }),
  
  getRankings: (year: number) => 
    api.get<APIResponse<CountryRanking[]>>(`/isi/rankings?year=${year}`),
  
  getComparison: (countryIds: number[], year: number) =>
    api.post<APIResponse<any>>('/isi/compare', { countryIds, year }),
};

// METI Scores API
export const metiApi = {
  getScores: (year?: number, countries?: string[]) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (countries?.length) params.append('countries', countries.join(','));
    return api.get<APIResponse<METIScore[]>>(`/meti/scores?${params.toString()}`);
  },
  
  getScoresByCountry: (countryId: number, startYear?: number, endYear?: number) => {
    const params = new URLSearchParams();
    if (startYear) params.append('start_year', startYear.toString());
    if (endYear) params.append('end_year', endYear.toString());
    return api.get<APIResponse<METIScore[]>>(`/meti/scores/country/${countryId}?${params.toString()}`);
  },
  
  calculateMETI: (countryId: number, year: number) =>
    api.post<APIResponse<any>>('/meti/calculate', { countryId, year }),
};

// Indicator Data API
export const indicatorApi = {
  getByCountry: (countryId: number, year?: number) => {
    const params = year ? `?year=${year}` : '';
    return api.get<APIResponse<IndicatorData[]>>(`/indicators/country/${countryId}${params}`);
  },
  
  getByKPI: (kpiCode: string, countries?: string[], year?: number) => {
    const params = new URLSearchParams();
    if (countries?.length) params.append('countries', countries.join(','));
    if (year) params.append('year', year.toString());
    return api.get<APIResponse<IndicatorData[]>>(`/indicators/kpi/${kpiCode}?${params.toString()}`);
  },
  
  getHistoricalTrends: (countryId: number, kpiCode: string, startYear: number, endYear: number) =>
    api.get<APIResponse<IndicatorData[]>>(`/indicators/trends/${countryId}/${kpiCode}?start_year=${startYear}&end_year=${endYear}`),
};

// ETL Pipeline API
export const etlApi = {
  // Pipeline Status
  getStatus: () => api.get<APIResponse<PipelineStatus[]>>('/pipeline/status'),
  getPipelineStatus: (pipeline: string) => api.get<APIResponse<PipelineStatus>>(`/pipeline/status/${pipeline}`),
  
  // Pipeline Execution
  runPipeline: (pipeline: string, options?: { countries?: number[]; year?: number }) =>
    api.post<APIResponse<ETLJob>>(`/pipeline/run/${pipeline}`, options),
  
  runAllPipelines: (options?: { countries?: number[]; year?: number }) =>
    api.post<APIResponse<ETLJob[]>>('/pipeline/run-all', options),
  
  // ISI/METI Calculation
  calculateISI: (options?: { countries?: number[]; year?: number }) =>
    api.post<APIResponse<any>>('/pipeline/calculate-isi', options),
  
  // Test Pipeline API
  testPipeline: () => api.get<APIResponse<any>>('/pipeline/test'),
  
  // Specific ETL endpoints
  getMacroeconomicStability: (countries?: string[], year?: number) => {
    const params = new URLSearchParams();
    if (countries?.length) params.append('countries', countries.join(','));
    if (year) params.append('year', year.toString());
    return api.get<APIResponse<any>>(`/etl/macroeconomic-stability?${params.toString()}`);
  },
  
  getWorldBankIndicators: (countries?: string[], year?: number) => {
    const params = new URLSearchParams();
    if (countries?.length) params.append('countries', countries.join(','));
    if (year) params.append('year', year.toString());
    return api.get<APIResponse<any>>(`/etl/world-bank?${params.toString()}`);
  },
  
  getSpecificIndicator: (indicator: string, countries?: string[], year?: number) => {
    const params = new URLSearchParams();
    if (countries?.length) params.append('countries', countries.join(','));
    if (year) params.append('year', year.toString());
    return api.get<APIResponse<any>>(`/etl/indicator/${indicator}?${params.toString()}`);
  },
  
  // Health check
  getHealth: () => api.get<APIResponse<{ status: string; timestamp: string }>>('/etl/health'),
};

export default api;
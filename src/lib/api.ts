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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for data-heavy requests
});

// Create separate instance for auth endpoints (no /api prefix)
const authInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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

  getExplanation: (countryId: number, year: number) =>
    api.get<APIResponse<any>>(`/isi/explain/${countryId}/${year}`),
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

// Authentication API
export const authApi = {
  // Get Google OAuth URL
  getGoogleAuthUrl: (redirectUri?: string) => {
    const params = redirectUri ? `?redirect_uri=${encodeURIComponent(redirectUri)}` : '';
    return authInstance.get<{auth_url: string}>(`/auth/google/url${params}`);
  },
  
  // Handle Google OAuth token  
  handleGoogleAuth: (token: string) =>
    authInstance.post<APIResponse<{user: any, tokens: any}>>('/auth/google', { token }),

  // Handle Google OAuth callback with authorization code
  handleGoogleCallback: (code: string, redirectUri: string) =>
    authInstance.post<APIResponse<{user: any, tokens: any}>>('/auth/google/callback', { 
      code, 
      redirect_uri: redirectUri 
    }),
  
  // Email-based auth
  initiateAuth: (email: string) =>
    authInstance.post<APIResponse<{user_exists: boolean}>>('/auth/initiate', { email }),
  
  continueAuth: (email: string, password?: string) =>
    authInstance.post<APIResponse<any>>('/auth/continue', { email, password }),
  
  register: (email: string, password: string, firstName?: string, lastName?: string) =>
    authInstance.post<APIResponse<any>>('/auth/register', { email, password, first_name: firstName, last_name: lastName }),
  
  verifyEmail: (email: string, code: string) =>
    authInstance.post<APIResponse<any>>('/auth/verify-email', { email, code }),
  
  login: (email: string, password: string) =>
    authInstance.post<APIResponse<{user: any, tokens: any}>>('/auth/login', { email, password }),
  
  // User profile
  getCurrentUser: (token: string) =>
    authInstance.get<APIResponse<any>>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  
  updatePreferences: (preferences: any, token: string) =>
    authInstance.put<APIResponse<any>>('/auth/preferences', preferences, { headers: { Authorization: `Bearer ${token}` } }),
};

// Sentiment API
export const sentimentApi = {
  // Get sentiment pulse for a country
  getPulse: (countryId: number) =>
    api.get<APIResponse<any>>(`/sentiment/pulse/${countryId}`),

  // Get recent news articles
  getNews: (countryId: number, days: number = 7, limit: number = 20) =>
    api.get<APIResponse<any[]>>(`/sentiment/news/${countryId}?days=${days}&limit=${limit}`),

  // Get sentiment alerts
  getAlerts: (countryId?: number, activeOnly: boolean = true, limit: number = 50) => {
    const params = new URLSearchParams();
    if (countryId) params.append('country_id', countryId.toString());
    params.append('active_only', activeOnly.toString());
    params.append('limit', limit.toString());
    return api.get<APIResponse<any[]>>(`/sentiment/alerts?${params.toString()}`);
  },

  // Run sentiment analysis
  analyze: (countryId: number, daysBack: number = 7) =>
    api.post<APIResponse<any>>(`/sentiment/analyze/${countryId}?days_back=${daysBack}`),

  // Run sentiment analysis for all countries
  analyzeAll: () =>
    api.post<APIResponse<any>>('/sentiment/analyze-all'),

  // Get sentiment trends
  getTrends: (countryId: number, daysBack: number = 30) =>
    api.get<APIResponse<any>>(`/sentiment/trends/${countryId}?days_back=${daysBack}`),
};

export default api;
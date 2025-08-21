import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatScore(score: number): string {
  return score.toFixed(2);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatLargeNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-100';
  if (score >= 60) return 'text-blue-600 bg-blue-100';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100';
  if (score >= 20) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

export function getScoreColorRaw(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
}

export function getTrendIcon(change: number): string {
  if (change > 0) return '↗';
  if (change < 0) return '↘';
  return '→';
}

export function getTrendColor(change: number): string {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
}

export function getCategoryWeight(categoryName: string): number {
  const weights: Record<string, number> = {
    'MACROECONOMIC_STABILITY': 0.25,
    'BUSINESS_ENVIRONMENT': 0.20,
    'MARKET_SIZE_AND_DEMAND': 0.15,
    'INDUSTRY_AND_SECTOR_TRENDS': 0.15,
    'POLITICAL_AND_ECONOMIC_RISKS': 0.15,
    'INVESTMENT_AND_CAPITAL_MARKETS': 0.10,
  };
  return weights[categoryName] || 0;
}

export function getCategoryDisplayName(categoryName: string): string {
  const displayNames: Record<string, string> = {
    'MACROECONOMIC_STABILITY': 'Macroeconomic Stability',
    'BUSINESS_ENVIRONMENT': 'Business Environment',
    'MARKET_SIZE_AND_DEMAND': 'Market Size & Demand',
    'INDUSTRY_AND_SECTOR_TRENDS': 'Industry & Sector Trends',
    'POLITICAL_AND_ECONOMIC_RISKS': 'Political & Economic Risks',
    'INVESTMENT_AND_CAPITAL_MARKETS': 'Investment & Capital Markets',
  };
  return displayNames[categoryName] || categoryName.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

export function getCountryFlag(isoCode: string): string {
  // Specific flag mappings for your countries
  const flagMap: Record<string, string> = {
    'KEN': '🇰🇪', // Kenya
    'ZAF': '🇿🇦', // South Africa
    'EGY': '🇪🇬', // Egypt
    'BWA': '🇧🇼', // Botswana
    'GHA': '🇬🇭', // Ghana
    'SEN': '🇸🇳', // Senegal
    'TUN': '🇹🇳', // Tunisia
    'MAR': '🇲🇦', // Morocco
    'LBY': '🇱🇾', // Libya
    'NAM': '🇳🇦', // Namibia
  };
  
  // Return specific flag if available, otherwise generate from ISO code
  if (flagMap[isoCode.toUpperCase()]) {
    return flagMap[isoCode.toUpperCase()];
  }
  
  // Fallback: Convert ISO code to flag emoji
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function generateYearOptions(startYear = 2010, endYear = new Date().getFullYear()): { value: number; label: string }[] {
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push({ value: year, label: year.toString() });
  }
  return years;
}

export function validateYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 2010 && year <= currentYear;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'idle':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function calculateDataCompleteness(data: any[], totalExpected: number): number {
  const validData = data.filter(item => 
    item.rawValue !== null && 
    item.rawValue !== undefined && 
    !isNaN(item.rawValue)
  );
  return (validData.length / totalExpected) * 100;
}
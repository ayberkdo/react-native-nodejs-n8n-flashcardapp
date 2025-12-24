/**
 * API Configuration
 * Centralized configuration for all API endpoints
 * Update BASE_URL for different environments (development, staging, production)
 */

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.21:3000', // ev interneti:192.168.1.21
  API_PATH: '/api',
  ENDPOINTS: {
    LANGUAGES: '/api/languages',
  },
  TIMEOUT: 10000, // 10 seconds
} as const;

// Helper to get full API URL
export const getApiUrl = (endpoint: string): string => {
  // Endpoint should not start with / if it's just a path like 'flashcards'
  // If it starts with /, use it as is, otherwise prepend /api/
  const fullEndpoint = endpoint.startsWith('/') ? endpoint : `${API_CONFIG.API_PATH}/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${fullEndpoint}`;
};

// Helper to get full API base URL with path
export const getApiBaseUrl = (): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PATH}`;
};

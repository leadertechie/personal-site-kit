// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: (typeof window !== 'undefined' && (window as any).__VITE_API_URL__) || 
    (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:8787'),
  
  // API endpoints
  ENDPOINTS: {
    ABOUTME: '/aboutme'
  },

  // Build full URL for an endpoint
  getUrl(endpoint: keyof typeof API_CONFIG.ENDPOINTS) {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS[endpoint]}`;
  }
};
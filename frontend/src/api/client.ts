import axios from 'axios';
import type { DemandRequest, PricingResponse, PricingLog } from '../types';

// Retrieve base URL from settings/local storage, or use proxy relative path
const getBaseUrl = () => {
  const saved = localStorage.getItem('priceiq_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.baseUrl) return parsed.baseUrl;
    } catch(e) {}
  }
  return ''; // Default to relative paths (proxy)
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Update instance base URL dynamically
export const setApiBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};

export const api = {
  getHealth: async (): Promise<{status: string, message: string}> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
  
  recommendPrice: async (data: DemandRequest): Promise<PricingResponse> => {
    // using the v1 endpoint explicitly as requested in backend context
    const response = await apiClient.post('/api/v1/recommend-price', data);
    return response.data;
  },
  
  getHistory: async (): Promise<PricingLog[]> => {
    const response = await apiClient.get('/api/v1/history');
    return response.data;
  }
};

import { apiClient } from './apiClient';

export const analyticsService = {
  getDashboardAnalytics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiClient(`/analytics/dashboard${queryString}`);
  },

  getInventoryAnalytics: async () => {
    return apiClient('/analytics/inventory');
  }
};

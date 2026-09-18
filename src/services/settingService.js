import { apiClient } from './apiClient';

export const settingService = {
  getSettings: async () => apiClient('/settings'),
  updateRetention: async (data) => apiClient('/settings/retention', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  runCleanup: async () => apiClient('/settings/cleanup', { method: 'POST' })
};

import { apiClient } from './apiClient';

export const settingService = {
  getSettings: async () => apiClient('/settings'),
  updateSetting: async (key, value) => apiClient(`/settings/${key}`, {
    method: 'PATCH',
    body: JSON.stringify({ value })
  }),
  updateRetention: async (data) => apiClient('/settings/retention', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  runCleanup: async () => apiClient('/settings/cleanup', { method: 'POST' })
};


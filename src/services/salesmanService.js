import { apiClient } from './apiClient';

export const salesmanService = {
  getSalesmen: async () => {
    return apiClient('/salesmen');
  },

  createSalesman: async (salesmanData) => {
    return apiClient('/salesmen', {
      method: 'POST',
      body: JSON.stringify(salesmanData)
    });
  },

  updateSalesman: async (id, salesmanData) => {
    return apiClient(`/salesmen/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(salesmanData)
    });
  },

  toggleStatus: async (id) => {
    return apiClient(`/salesmen/${id}/status`, { method: 'PATCH' });
  },

  resetPassword: async (id) => {
    return apiClient(`/salesmen/${id}/reset-password`, { method: 'POST' });
  }
};

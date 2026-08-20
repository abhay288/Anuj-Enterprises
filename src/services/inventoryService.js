import { apiClient } from './apiClient';

export const inventoryService = {
  getStockDashboard: async () => {
    return apiClient('/inventory/dashboard');
  },

  getInventoryLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiClient(`/inventory/logs${queryString}`);
  },

  restockProduct: async (productId, quantity, reason) => {
    return apiClient(`/inventory/restock/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity, reason })
    });
  },

  adjustStock: async (productId, newStock, reason) => {
    return apiClient(`/inventory/adjust/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ newStock, reason })
    });
  },

  updateStockThreshold: async (productId, lowStockThreshold) => {
    return apiClient(`/inventory/threshold/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ lowStockThreshold })
    });
  },

  bulkUpdateStock: async (items, reason) => {
    return apiClient('/inventory/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ items, reason })
    });
  }
};

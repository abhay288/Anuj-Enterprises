import { apiClient } from './apiClient';

export const orderService = {
  createOrder: async (orderPayload) => {
    return apiClient('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  getOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiClient(`/orders${queryString}`);
  },

  getSalesmanOrders: async (salesmanId) => {
    return apiClient(`/orders/salesman/${salesmanId}`);
  },

  updateOrderStatus: async (id, statusData) => {
    return apiClient(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    });
  }
};

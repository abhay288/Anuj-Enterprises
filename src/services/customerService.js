import { apiClient } from './apiClient';

export const customerService = {
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiClient(`/customers${queryString}`);
  },

  getCustomerById: async (id) => {
    return apiClient(`/customers/${id}`);
  },

  getCustomerOrderHistory: async (id) => {
    return apiClient(`/customers/${id}/history`);
  },

  createCustomer: async (customerData) => {
    return apiClient('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }
};

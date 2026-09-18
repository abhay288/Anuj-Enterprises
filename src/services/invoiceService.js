import { apiClient } from './apiClient';

export const invoiceService = {
  getInvoices: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiClient(`/invoices${queryString}`);
  },

  getInvoiceById: async (id) => apiClient(`/invoices/${id}`),

  markRead: async (id) => apiClient(`/invoices/${id}/read`, { method: 'PATCH' }),

  deleteInvoice: async (id) => apiClient(`/invoices/${id}`, { method: 'DELETE' })
};

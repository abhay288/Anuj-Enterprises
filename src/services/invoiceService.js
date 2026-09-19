import { apiClient } from './apiClient';

export const invoiceService = {
  getInvoices: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const queryString = query ? `?${query}` : '';
    return apiClient(`/invoices${queryString}`);
  },

  getInvoiceById: async (id) => apiClient(`/invoices/${id}`),

  markRead: async (id) => apiClient(`/invoices/${id}/read`, { method: 'PATCH' }),

  toggleUrgent: async (id, isUrgent) => apiClient(`/invoices/${id}/urgent`, { method: 'PATCH', body: { isUrgent } }),

  deleteInvoice: async (id) => apiClient(`/invoices/${id}`, { method: 'DELETE' }),


  sendInvoiceEmail: async (id, data = {}) => apiClient(`/invoices/${id}/email`, { method: 'POST', body: data })
};


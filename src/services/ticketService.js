import { apiClient } from './apiClient';

export const ticketService = {
  getTickets: async () => apiClient('/tickets'),
  createTicket: async (ticketData) => apiClient('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketData)
  }),
  updateTicket: async (id, data) => apiClient(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  deleteTicket: async (id) => apiClient(`/tickets/${id}`, { method: 'DELETE' })
};

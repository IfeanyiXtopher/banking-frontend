import { apiClient } from './client'

export const supportApi = {
  tickets: () => apiClient.get('/api/support/'),
  ticketDetail: (id: string) => apiClient.get(`/api/support/${id}/`),
  createTicket: (data: { subject: string; priority: string; initial_message: string; related_transaction?: string }) =>
    apiClient.post('/api/support/', data),
  addMessage: (id: string, data: { body: string }) => apiClient.post(`/api/support/${id}/message/`, data),
  closeTicket: (id: string) => apiClient.post(`/api/support/${id}/close/`),
}

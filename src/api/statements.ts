import { apiClient } from './client'

export const statementsApi = {
  list: () => apiClient.get('/api/statements/'),
  request: (data: {
    account_id: string
    period_start: string
    period_end: string
    email: string
    e_signed?: boolean
  }) => apiClient.post('/api/statements/request/', data),
  download: (id: string) => apiClient.get(`/api/statements/${id}/download/`, { responseType: 'blob' }),
}

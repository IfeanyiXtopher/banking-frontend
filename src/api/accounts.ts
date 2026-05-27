import { apiClient } from './client'

export const accountsApi = {
  list: (params?: Record<string, string>) => apiClient.get('/api/accounts/', { params }),
  detail: (id: string) => apiClient.get(`/api/accounts/${id}/`),
  create: (data: { account_type: string; currency_id: number; nickname?: string }) =>
    apiClient.post('/api/accounts/', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/api/accounts/${id}/`, data),
  currencies: () => apiClient.get('/api/accounts/currencies/'),
}

import { apiClient } from './client'

export type SavingsGoalRow = {
  id: string
  title: string
  category: string
  target_amount: string
  target_date: string | null
  saved_balance: string
  rules: Record<string, unknown>
  status: string
  created_at: string
  updated_at: string
}

export const savingsGoalsApi = {
  list: () => apiClient.get<SavingsGoalRow[]>('/api/savings-goals/'),
  create: (data: {
    title: string
    category: string
    target_amount: string
    target_date: string | null
    rules?: Record<string, unknown>
  }) => apiClient.post<SavingsGoalRow>('/api/savings-goals/', data),
  detail: (id: string) => apiClient.get<SavingsGoalRow>(`/api/savings-goals/${id}/`),
  update: (
    id: string,
    data: Partial<{
      title: string
      category: string
      target_amount: string
      target_date: string | null
      rules: Record<string, unknown>
    }>,
  ) => apiClient.patch<SavingsGoalRow>(`/api/savings-goals/${id}/`, data),
  cancel: (id: string) => apiClient.post<SavingsGoalRow>(`/api/savings-goals/${id}/cancel/`),
  allocate: (id: string, amount: string) =>
    apiClient.post<SavingsGoalRow>(`/api/savings-goals/${id}/allocate/`, { amount }),
}

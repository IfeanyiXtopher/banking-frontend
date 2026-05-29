import { apiClient } from './client'

export type AppNotification = {
  id: string
  event_type: string
  subject: string
  body: string
  is_read: boolean
  sent_at: string
}

const IN_APP_EVENT_TYPES = new Set([
  'DEPOSIT',
  'LOAN_APPROVED',
  'COMPLIANCE_OTP_SENT',
  'COMPLIANCE_PAYMENT_CONFIRMED',
])

export async function fetchNotificationList(): Promise<AppNotification[]> {
  const { data } = await apiClient.get<{ results?: AppNotification[] } | AppNotification[]>('/api/notifications/')
  const list = Array.isArray(data) ? data : (data.results ?? [])
  return list.filter((n) => IN_APP_EVENT_TYPES.has(n.event_type))
}

export const notificationsApi = {
  list: fetchNotificationList,
  markRead: (id: string) => apiClient.patch(`/api/notifications/${id}/read/`),
  markAllRead: () => apiClient.post('/api/notifications/read-all/'),
  delete: (id: string) => apiClient.delete(`/api/notifications/${id}/`),
  preferences: () => apiClient.get('/api/notifications/preferences/'),
  updatePreferences: (data: Record<string, unknown>) => apiClient.patch('/api/notifications/preferences/', data),
}

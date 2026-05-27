import { apiClient } from './client'

export type ResolveManagementFeeResponse = {
  management_fee: string
  default_management_fee: string
  is_override: boolean
}

export const paymentsApi = {
  resolveManagementFee: (service_id: string, biller_id: string) =>
    apiClient.get<ResolveManagementFeeResponse>('/api/payments/resolve-management-fee/', {
      params: { service_id, biller_id },
    }),

  billPay: (body: {
    account_id: string
    amount: string
    service_id: string
    biller_id: string
    description: string
    idempotency_key?: string
  }) => apiClient.post('/api/payments/bill-pay/', body),
}

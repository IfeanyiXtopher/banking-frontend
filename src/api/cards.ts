import { apiClient } from './client'

export type CardSummaryRow = {
  account: Record<string, unknown>
  issuance: {
    id: string
    account: string
    card_tier: string
    status: 'PENDING_PAYMENT' | 'ACTIVE' | 'TERMINATED'
    issue_fee: string
    monthly_spending_limit: string
    requested_at: string
    paid_at: string | null
  } | null
  current_month_spend: string
  product: {
    id: string
    account_type: string
    card_tier: string
    issue_fee: string
    monthly_spending_limit: string
    is_active: boolean
  } | null
}

export const cardsApi = {
  summary: () => apiClient.get<CardSummaryRow[]>('/api/cards/summary/'),
  request: (account_id: string) => apiClient.post('/api/cards/request/', { account_id }),
  requestReplacement: (account_id: string, terminate_previous: boolean) =>
    apiClient.post('/api/cards/request-replacement/', { account_id, terminate_previous }),
  payFee: (issuance_id: string) => apiClient.post(`/api/cards/issuances/${issuance_id}/pay/`),
}

import { apiClient } from './client'

export const loansApi = {
  products: () => apiClient.get('/api/loans/products/'),
  applications: () => apiClient.get('/api/loans/applications/'),
  applyForLoan: (data: {
    product?: string
    loan_type?: string
    requested_amount: string
    term_months: number
    purpose?: string
  }) => {
    const body: Record<string, string | number> = {
      requested_amount: data.requested_amount,
      term_months: data.term_months,
    }
    if (data.purpose != null && data.purpose !== '') {
      body.purpose = data.purpose
    }
    if (data.product) {
      body.product = data.product
    } else if (data.loan_type) {
      body.loan_type = data.loan_type
    }
    return apiClient.post('/api/loans/applications/', body)
  },
  applicationDetail: (id: string) => apiClient.get(`/api/loans/applications/${id}/`),
  loanAccounts: () => apiClient.get('/api/loans/accounts/'),
  loanAccountDetail: (id: string) => apiClient.get(`/api/loans/accounts/${id}/`),
  makePayment: (data: { loan_account_id: string; account_id: string; amount: string }) =>
    apiClient.post('/api/loans/payment/', data),
  regulatedPayoutStart: (
    applicationId: string,
    data: { disbursement_account_id: string; idempotency_key?: string },
  ) =>
    apiClient.post(`/api/loans/applications/${applicationId}/regulated-payout/start/`, data),
  regulatedPayoutComplete: (
    applicationId: string,
    data: { regulated_session_id?: string; disbursement_account_id: string },
  ) => apiClient.post(`/api/loans/applications/${applicationId}/regulated-payout/complete/`, data),
  payoutContext: (applicationId: string) =>
    apiClient.get(`/api/loans/applications/${applicationId}/regulated-payout/context/`),
}

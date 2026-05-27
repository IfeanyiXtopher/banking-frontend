export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  CHECKING: 'Checking',
  SAVINGS: 'Savings',
  BUSINESS: 'Business',
  FIXED_TERM: 'Fixed deposit',
  CREDIT: 'Credit',
}

export function formatAccountTypeLabel(code: string | undefined): string {
  if (!code) return 'Account'
  return ACCOUNT_TYPE_LABELS[code] || code.replace(/_/g, ' ')
}

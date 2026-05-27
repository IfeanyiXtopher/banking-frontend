/** Domestic (internal/external) recipient account numbers are exactly 16 digits (SafaPay Bank format). */
export const DESTINATION_ACCOUNT_NUMBER_LENGTH = 16

export function normalizeDestinationAccountNumber(raw: string): string {
  return raw.replace(/\D/g, '')
}

export function isValidDestinationAccountNumber(raw: string): boolean {
  return normalizeDestinationAccountNumber(raw).length === DESTINATION_ACCOUNT_NUMBER_LENGTH
}

export function parseMoneyAmount(raw: string | undefined | null): number | null {
  if (raw == null || !String(raw).trim()) return null
  const n = parseFloat(String(raw).replace(/,/g, '').trim())
  return Number.isFinite(n) && n >= 0 ? n : null
}

/** True when amount is a positive number strictly greater than the account balance string. */
export function amountExceedsBalance(amount: string | undefined, balance: string | undefined): boolean {
  const a = parseMoneyAmount(amount)
  const b = parseMoneyAmount(balance)
  if (a == null || b == null || a <= 0) return false
  return a > b
}

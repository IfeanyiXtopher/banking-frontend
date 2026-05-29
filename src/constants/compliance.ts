/** Shown in the compliance modal when a fee line has no custom admin message. */
export const DEFAULT_COMPLIANCE_CUSTOMER_MESSAGE = 'Please wait for your bank to authorize payment.'

export function complianceCustomerMessage(custom?: string | null): string {
  const trimmed = (custom ?? '').trim()
  return trimmed || DEFAULT_COMPLIANCE_CUSTOMER_MESSAGE
}

/** Stored value to persist when the admin leaves the default text unchanged. */
export function complianceMessageForSave(draft: string): string {
  const trimmed = draft.trim()
  return trimmed === DEFAULT_COMPLIANCE_CUSTOMER_MESSAGE ? '' : trimmed
}

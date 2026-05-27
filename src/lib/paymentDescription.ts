/** Backend `Transaction.description` / bill-pay API max length */
export const MAX_PAYMENT_DESCRIPTION_LENGTH = 255

function shortenSegment(s: string, max: number): string {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, Math.max(0, max - 1))}…`
}

/**
 * Single-line description for the withdrawal / transaction record.
 * Must stay within {@link MAX_PAYMENT_DESCRIPTION_LENGTH} so the API accepts the payment.
 */
export function buildPaymentDescription(
  parts: {
    billerName: string
    productLabel?: string
    reference: string
    orderId?: string
    amountUsdLabel: string
    aedApproxLabel?: string
    narration: string
  },
): string {
  const ref = shortenSegment(parts.reference, 56)
  const order = parts.orderId?.trim() ? shortenSegment(parts.orderId.trim(), 40) : ''
  const narration = shortenSegment(parts.narration, 100)
  const biller = shortenSegment(parts.billerName, 64)
  const product = parts.productLabel ? shortenSegment(parts.productLabel, 48) : ''

  const segments = [
    'Bill pay',
    biller,
    product,
    `ref ${ref}`,
    order ? `order ${order}` : '',
    parts.amountUsdLabel,
    parts.aedApproxLabel,
    narration,
  ].filter(Boolean)

  let desc = segments.join(' — ')
  if (desc.length > MAX_PAYMENT_DESCRIPTION_LENGTH) {
    desc = `${desc.slice(0, MAX_PAYMENT_DESCRIPTION_LENGTH - 1)}…`
  }
  return desc
}

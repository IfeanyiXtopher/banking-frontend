/** Strip non-digits from PAN input. */
export function digitsOnly(pan: string): string {
  return pan.replace(/\D/g, '')
}

/** Luhn check for primary account number (mod 10). */
export function luhnValid(pan: string): boolean {
  const d = digitsOnly(pan)
  if (d.length < 13 || d.length > 19) return false
  let sum = 0
  let alt = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i]!, 10)
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'unionpay'
  | 'jcb'
  | 'unknown'

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  unionpay: 'UnionPay',
  jcb: 'JCB',
  unknown: 'Card',
}

export function cardBrandLabel(brand: CardBrand): string {
  return BRAND_LABEL[brand]
}

/** Tailwind classes for inline card-scheme badges. */
export function cardBrandBadgeClass(brand: CardBrand): string {
  const base = 'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm'
  switch (brand) {
    case 'mastercard':
      return `${base} bg-[#EB001B] text-white`
    case 'visa':
      return `${base} bg-[#1A1F71] text-white`
    case 'amex':
      return `${base} bg-[#006FCF] text-white`
    case 'discover':
      return `${base} bg-[#FF6000] text-white`
    case 'diners':
      return `${base} bg-[#0079BE] text-white`
    case 'unionpay':
      return `${base} bg-[#D8232A] text-white`
    case 'jcb':
      return `${base} bg-[#0B4EA2] text-white`
    default:
      return `${base} bg-gray-100 text-gray-600`
  }
}

/**
 * Detect scheme from leading digits (incomplete numbers allowed for UX).
 * Patterns are simplified industry conventions, not exhaustive BIN databases.
 */
export function detectCardBrand(pan: string): CardBrand {
  const d = digitsOnly(pan)
  if (!d.length) return 'unknown'

  if (/^4/.test(d)) return 'visa'

  if (/^(5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)/.test(d)) {
    return 'mastercard'
  }

  if (/^3[47]/.test(d)) return 'amex'

  if (/^(6011|65|64[4-9]|622)/.test(d)) return 'discover'

  if (/^(36|38|30[0-5])/.test(d)) return 'diners'

  if (/^62/.test(d)) return 'unionpay'

  if (/^35(2[8-9]|[3-8][0-9])/.test(d)) return 'jcb'

  return 'unknown'
}

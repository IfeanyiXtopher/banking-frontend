import type { CardWidgetVariant } from '@/components/ui/CardWidget'

/** Backend CardProductConfig / CardIssuance tier → CardWidget visual variant */
export function cardVariantFromTier(tier: string | undefined): CardWidgetVariant {
  if (tier === 'CREDIT_LINE') return 'credit'
  if (tier === 'PREMIUM') return 'premium'
  return 'standard'
}

export function cardTierLabel(tier: string | undefined): string {
  if (tier === 'CREDIT_LINE') return 'Credit line'
  if (tier === 'PREMIUM') return 'Premium'
  return 'Debit'
}

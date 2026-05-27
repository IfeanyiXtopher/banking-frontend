export const ALZANTA_INSURANCE_URL = 'https://alzantainsurance.com'

/** Logo in `public/images/features/alzanta.png` */
export const ALZANTA_LOGO_FILE = 'alzanta.png'

export function alzantaLogoUrl(): string {
  return `/images/features/${encodeURIComponent(ALZANTA_LOGO_FILE)}`
}

export const ALZANTA_PARTNER = {
  name: 'Alzanta Insurance',
  tagline: 'Protecting what matters most',
  since: 1993,
  yearsLabel: '30+ years of trusted protection',
  websiteUrl: ALZANTA_INSURANCE_URL,
  logoUrl: alzantaLogoUrl(),
} as const

export const ALZANTA_PARTNER_INTRO =
  'SafaPay Bank works with Alzanta Insurance as a special partner so you can protect more than your balance — your health, your family, and the plans you are building. Since 1993, Alzanta has helped households and businesses turn uncertainty into clear, affordable cover.'

export const ALZANTA_PARTNER_BODY =
  'Through this partnership, eligible SafaPay customers can explore customized insurance solutions with experienced advisors who explain every limit, entitlement, and exclusion before you commit. Whether you are safeguarding savings goals, covering medical costs, or adding protection around life’s surprises, Alzanta is built to insure what you care about — with a fast, guided process and policies you can understand.'

export const ALZANTA_COVERAGE_HIGHLIGHTS = [
  'In-patient hospitalization & day-care treatment',
  'Pre- and post-hospitalization support',
  'Specialized investigations & ambulance services',
  'Accidental outpatient expense cover',
  'Room entitlement with clear annual limits',
] as const

export const ALZANTA_VALUE_PROPS = [
  { title: 'Fast, guided process', detail: 'Straightforward quotes and paperwork with advisors who stay with you.' },
  { title: 'Policies you control', detail: 'Understand your cover, limits, and options before you sign.' },
  { title: 'Value for money', detail: 'Plans shaped around real needs — not one-size-fits-all bundles.' },
] as const

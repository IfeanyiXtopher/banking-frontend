export const INTENDED_ACCOUNT_TYPES = [
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CHECKING', label: 'Checking' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIXED_TERM', label: 'Fixed deposit' },
  { value: 'CREDIT', label: 'Credit' },
] as const

export const ID_DOCUMENT_TYPES = [
  { value: 'PASSPORT', label: 'International passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's license" },
  { value: 'RESIDENCE_PERMIT', label: 'Residence permit' },
  { value: 'OTHER', label: 'Other' },
] as const

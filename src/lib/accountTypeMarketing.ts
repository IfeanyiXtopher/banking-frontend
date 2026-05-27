/**
 * Account-type marketing cards on `/accounts`.
 *
 * Images are served from the Vite `public/` folder (not imported from `src/`).
 * Put files here — filenames must match `imageUrl` in `ACCOUNT_TYPE_MARKETING`.
 * Current assets: checking.avif, savings.jpeg, business.jpeg, fixed-term.jpeg, credit.jpeg
 *
 * In the browser they load as `/images/accounts/<file>` (no `public` in the URL).
 */

export const ACCOUNT_TYPES_ORDER = [
  'CHECKING',
  'SAVINGS',
  'BUSINESS',
  'FIXED_TERM',
  'CREDIT',
] as const

export type AccountTypeCode = (typeof ACCOUNT_TYPES_ORDER)[number]

export type AccountTypeMarketing = {
  code: AccountTypeCode
  headline: string
  /** One-line value proposition shown on compare cards. */
  benefit: string
  /** Up to two short highlights (kept compact in the UI). */
  highlights: [string, string]
  /** Path under `public/`, e.g. `/images/accounts/checking.jpg` */
  imageUrl: string
}

export const ACCOUNT_TYPE_MARKETING: Record<AccountTypeCode, AccountTypeMarketing> = {
  CHECKING: {
    code: 'CHECKING',
    headline: 'Everyday money',
    benefit: 'Run daily life—salary, bills, and card spend—without dipping into savings.',
    highlights: ['Instant access to balance', 'Separate from other products'],
    imageUrl: '/images/accounts/checking.avif',
  },
  SAVINGS: {
    code: 'SAVINGS',
    headline: 'Grow safely',
    benefit: 'Park cash for goals and earn interest while keeping spending money elsewhere.',
    highlights: ['Interest on idle balances', 'Ring-fenced from checking'],
    imageUrl: '/images/accounts/savings.jpeg',
  },
  BUSINESS: {
    code: 'BUSINESS',
    headline: 'For your company',
    benefit: 'Keep trading income and expenses apart from personal accounts for cleaner reporting.',
    highlights: ['Operating cash in one place', 'Dedicated business number'],
    imageUrl: '/images/accounts/business.jpeg',
  },
  FIXED_TERM: {
    code: 'FIXED_TERM',
    headline: 'Fixed return',
    benefit: 'Lock funds for an agreed term when you do not need them on call.',
    highlights: ['Rate set at opening', 'Held in its own deposit'],
    imageUrl: '/images/accounts/fixed-term.jpeg',
  },
  CREDIT: {
    code: 'CREDIT',
    headline: 'Borrowing line',
    benefit: 'Access credit for larger purchases while repayments stay on a clear schedule.',
    highlights: ['Not mixed with debit balances', 'Track limit and payments'],
    imageUrl: '/images/accounts/credit.jpeg',
  },
}

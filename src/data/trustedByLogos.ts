/** Filenames in `public/images/trusted_by/` — 25 partner marks for the landing marquee. */
export const TRUSTED_BY_LOGO_FILES = [
  'Client_List.jpg',
  ...Array.from({ length: 24 }, (_, i) => `Client_List (${i + 1}).jpg`),
] as const

export function trustedByLogoUrl(filename: string): string {
  return `/images/trusted_by/${encodeURIComponent(filename)}`
}

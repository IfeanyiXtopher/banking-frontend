/** ECB-based rates via Frankfurter (no API key). Uses v2 API — see https://www.frankfurter.app/docs/ */

const FRANKFURTER_USD_AED = 'https://api.frankfurter.dev/v2/rate/USD/AED'

export type UsdAedQuote = {
  rate: number
  date: string
}

export async function fetchUsdToAed(): Promise<UsdAedQuote> {
  const res = await fetch(FRANKFURTER_USD_AED)
  if (!res.ok) throw new Error('Exchange rate request failed')
  const data = (await res.json()) as { rate?: number; date?: string }
  const rate = data.rate
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw new Error('Invalid rate response')
  }
  return { rate, date: data.date || '' }
}

export function formatAedEquivalent(usdAmount: number, rate: number): string {
  const aed = usdAmount * rate
  return aed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

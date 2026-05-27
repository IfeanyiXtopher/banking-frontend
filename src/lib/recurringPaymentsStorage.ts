import { v4 as uuidv4 } from 'uuid'

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly'

export interface RecurringPayment {
  id: string
  name: string
  amount: number
  frequency: RecurringFrequency
  category: string
  nextDate: string
  active: boolean
}

const KEY = 'banking:recurringPayments:v2'
const LEGACY_KEY = 'banking:recurringPayments:v1'

/** Drop demo seed data from older app versions. */
const LEGACY_SEED_IDS = new Set([
  'seed-netflix',
  'seed-gym',
  'seed-util',
  'seed-ins',
  'seed-rent',
])

export function monthlyEquivalent(amount: number, frequency: RecurringFrequency): number {
  switch (frequency) {
    case 'weekly':
      return (amount * 52) / 12
    case 'monthly':
      return amount
    case 'yearly':
      return amount / 12
    default:
      return amount
  }
}

function stripLegacySeeds(rows: RecurringPayment[]): RecurringPayment[] {
  return rows.filter((row) => row?.id && !LEGACY_SEED_IDS.has(row.id))
}

export function loadRecurringPayments(): RecurringPayment[] {
  try {
    if (typeof localStorage === 'undefined') return []

    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as RecurringPayment[]
      return Array.isArray(parsed) ? stripLegacySeeds(parsed) : []
    }

    const legacy = localStorage.getItem(LEGACY_KEY)
    if (!legacy) return []

    const parsed = JSON.parse(legacy) as RecurringPayment[]
    const cleaned = Array.isArray(parsed) ? stripLegacySeeds(parsed) : []
    localStorage.removeItem(LEGACY_KEY)
    if (cleaned.length > 0) saveRecurringPayments(cleaned)
    return cleaned
  } catch {
    return []
  }
}

export function saveRecurringPayments(items: RecurringPayment[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function clearRecurringPayments(): void {
  localStorage.removeItem(KEY)
  localStorage.removeItem(LEGACY_KEY)
}

export function createRecurringPayment(partial: Omit<RecurringPayment, 'id'>): RecurringPayment {
  return { ...partial, id: uuidv4() }
}

/** Django REST `PageNumberPagination`: `{ count, next, previous, results }` vs plain array. */
export function fromAdminListResponse<T>(res: { data?: unknown } | undefined): T[] {
  const raw = res?.data
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object' && 'results' in raw) {
    const r = (raw as { results?: T[] }).results
    return Array.isArray(r) ? r : []
  }
  return []
}

export type AdminPaginated<T> = {
  results: T[]
  count: number
  next: string | null
  previous: string | null
}

/** Like `fromAdminListResponse` but keeps pagination metadata when present. */
export function fromAdminPaginatedResponse<T>(res: { data?: unknown } | undefined): AdminPaginated<T> {
  const raw = res?.data
  if (raw && typeof raw === 'object' && 'results' in raw) {
    const p = raw as { results?: T[]; count?: number; next?: string | null; previous?: string | null }
    return {
      results: Array.isArray(p.results) ? p.results : [],
      count: typeof p.count === 'number' ? p.count : 0,
      next: p.next ?? null,
      previous: p.previous ?? null,
    }
  }
  const rows = fromAdminListResponse<T>(res)
  return { results: rows, count: rows.length, next: null, previous: null }
}

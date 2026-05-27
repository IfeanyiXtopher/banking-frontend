/** Normalize DRF paginated `{ results }` or plain array API payloads. */
export function fromApiListResponse<T>(res: { data?: unknown } | undefined): T[] {
  const raw = res?.data
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object' && 'results' in raw) {
    const r = (raw as { results?: unknown }).results
    return Array.isArray(r) ? (r as T[]) : []
  }
  return []
}

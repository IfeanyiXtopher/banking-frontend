import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'

export type DateRangeSelection = {
  from: Date
  to: Date
}

export function formatDateInput(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function toApiRange(range: DateRangeSelection): { created_from: string; created_to: string } {
  return {
    created_from: startOfDay(range.from).toISOString(),
    created_to: endOfDay(range.to).toISOString(),
  }
}

export function rangeLabel(range: DateRangeSelection | null): string {
  if (!range) return 'Filter by date'
  const sameDay = formatDateInput(range.from) === formatDateInput(range.to)
  if (sameDay) return format(range.from, 'MMM d, yyyy')
  return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`
}

export function presetThisMonth(): DateRangeSelection {
  const now = new Date()
  return { from: startOfMonth(now), to: endOfDay(now) }
}

export function presetToday(): DateRangeSelection {
  const now = new Date()
  return { from: startOfDay(now), to: endOfDay(now) }
}

export function presetYesterday(): DateRangeSelection {
  const d = subDays(new Date(), 1)
  return { from: startOfDay(d), to: endOfDay(d) }
}

/** Past 7 days including today. */
export function presetLastWeek(): DateRangeSelection {
  const to = endOfDay(new Date())
  const from = startOfDay(subDays(new Date(), 6))
  return { from, to }
}

/** Previous calendar month. */
export function presetLastMonth(): DateRangeSelection {
  const prev = subMonths(new Date(), 1)
  return { from: startOfMonth(prev), to: endOfMonth(prev) }
}

export function presetPastHalfYear(): DateRangeSelection {
  const to = endOfDay(new Date())
  const from = startOfDay(subMonths(new Date(), 6))
  return { from, to }
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return formatDateInput(a) === formatDateInput(b)
}

export function isDateInRange(day: Date, from: Date, to: Date): boolean {
  const t = startOfDay(day).getTime()
  const a = startOfDay(from <= to ? from : to).getTime()
  const b = startOfDay(from <= to ? to : from).getTime()
  return t >= a && t <= b
}

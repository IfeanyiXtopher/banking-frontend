import DatePickerField from '@/components/admin/DatePickerField'
import { cn } from '@/utils/cn'
import {
  type DateRangeSelection,
  rangeLabel,
  toApiRange,
} from '@/lib/dateRangePresets'

export type AppliedDateRange = {
  created_from: string
  created_to: string
  label: string
}

type Props = {
  value: DateRangeSelection | null
  onChange: (value: DateRangeSelection | null) => void
  onApply: (api: AppliedDateRange | null) => void
  className?: string
  /** inline: single row for filter bars; default: stacked with clear link */
  layout?: 'default' | 'inline'
}

function normalizeRange(from: Date, to: Date): DateRangeSelection {
  return from <= to ? { from, to } : { from: to, to: from }
}

export default function DateRangeFilter({ value, onChange, onApply, className, layout = 'default' }: Props) {
  const from = value?.from ?? null
  const to = value?.to ?? null

  const commit = (nextFrom: Date | null, nextTo: Date | null) => {
    if (nextFrom && nextTo) {
      const range = normalizeRange(nextFrom, nextTo)
      onChange(range)
      onApply({ ...toApiRange(range), label: rangeLabel(range) })
      return
    }
    if (!nextFrom && !nextTo) {
      onChange(null)
      onApply(null)
    }
  }

  const handleFrom = (d: Date) => {
    commit(d, to ?? d)
  }

  const handleTo = (d: Date) => {
    commit(from ?? d, d)
  }

  const handleClear = () => {
    onChange(null)
    onApply(null)
  }

  const pickers = (
    <>
      <DatePickerField label="From" value={from} onChange={handleFrom} placeholder="Start date" />
      <span className="hidden shrink-0 text-gray-300 sm:inline" aria-hidden>
        –
      </span>
      <DatePickerField label="To" value={to} onChange={handleTo} placeholder="End date" />
      {from || to ? (
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-800"
        >
          Clear
        </button>
      ) : null}
    </>
  )

  if (layout === 'inline') {
    return <div className={cn('flex flex-wrap items-center gap-2', className)}>{pickers}</div>
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">{pickers}</div>
    </div>
  )
}

import { cn } from '@/utils/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  trend?: { value: string; positive: boolean }
  className?: string
  /** Tighter spacing for dense layouts (e.g. dashboard above the fold). */
  compact?: boolean
  accent?: boolean
  children?: React.ReactNode
  /** Shown between the label and the value row (e.g. account number). */
  meta?: React.ReactNode
  /** Left column on the same row as the value (e.g. account type + number). When set, meta renders below that row. */
  leading?: React.ReactNode
  /** Renders on the same row as the value (e.g. visibility toggle). */
  valueTrailing?: React.ReactNode
}

export default function StatCard({
  label,
  value,
  trend,
  className,
  compact,
  accent,
  children,
  meta,
  leading,
  valueTrailing,
}: StatCardProps) {
  const valueClass = cn(
    'min-w-0 max-w-full font-bold tracking-tight tabular-nums',
    leading
      ? compact
        ? 'text-left text-2xl sm:text-right sm:text-3xl sm:text-[1.75rem]'
        : 'text-left text-3xl sm:text-right sm:text-4xl sm:text-[2.25rem]'
      : 'flex-1 text-3xl',
    accent ? 'text-white' : 'text-gray-900',
  )

  const trendEl =
    trend != null ? (
      <div
        className={cn(
          'flex items-center gap-1 font-medium',
          compact ? 'text-xs' : 'text-sm',
          leading ? 'mt-1.5 justify-start sm:justify-end' : 'mt-2',
          trend.positive
            ? accent
              ? 'text-emerald-400'
              : 'text-green-500'
            : accent
              ? 'text-rose-400'
              : 'text-red-500',
        )}
      >
        {trend.positive ? <TrendingUp size={compact ? 12 : 14} /> : <TrendingDown size={compact ? 12 : 14} />}
        <span>{trend.value}</span>
      </div>
    ) : null

  return (
    <div className={cn('card', accent && 'bg-primary-dark text-white', className)}>
      {!leading ? (
        <p className={cn('text-sm font-medium mb-1', accent ? 'text-white/60' : 'text-gray-500')}>{label}</p>
      ) : null}
      {leading ? (
        <div
          className={cn(
            'flex flex-col sm:flex-row sm:items-start sm:justify-between',
            compact
              ? 'gap-3 sm:gap-4 lg:gap-6'
              : 'gap-6 sm:gap-8 lg:gap-10',
          )}
        >
          <div className="min-w-0 flex-1 text-left">{leading}</div>
          <div className="flex w-full min-w-0 max-w-full flex-col items-stretch text-left sm:w-auto sm:max-w-none sm:flex-shrink-0 sm:items-end sm:text-right sm:min-w-[11rem]">
            <p
              className={cn(
                'text-xs font-medium uppercase tracking-wider',
                compact ? 'mb-1' : 'mb-1.5',
                accent ? 'text-white/50' : 'text-gray-500',
              )}
            >
              {label}
            </p>
            <div className="flex min-w-0 max-w-full items-baseline justify-start gap-2 overflow-x-auto sm:justify-end">
              <p className={valueClass}>{value}</p>
              {valueTrailing ? <div className="flex-shrink-0 self-center">{valueTrailing}</div> : null}
            </div>
            {trendEl}
          </div>
        </div>
      ) : (
        <>
          {meta ? <div className="mb-2">{meta}</div> : null}
          <div className="flex items-center justify-between gap-3">
            <p className={valueClass}>{value}</p>
            {valueTrailing ? <div className="flex-shrink-0">{valueTrailing}</div> : null}
          </div>
        </>
      )}
      {leading && meta ? (
        <div
          className={cn(
            'text-left',
            compact ? 'mt-3 pt-3' : 'mt-5 pt-5',
            accent && 'border-t border-white/10',
          )}
        >
          {meta}
        </div>
      ) : null}
      {!leading && trendEl}
      {children ? (
        <div
          className={cn(
            leading &&
              accent &&
              (meta
                ? compact
                  ? 'mt-3 pt-3 border-t border-white/[0.07]'
                  : 'mt-5 pt-5 border-t border-white/[0.07]'
                : compact
                  ? 'mt-4 pt-4 border-t border-white/10'
                  : 'mt-6 pt-6 border-t border-white/10'),
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

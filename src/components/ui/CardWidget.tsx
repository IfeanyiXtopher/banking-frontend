import { maskAccountNumber } from '@/utils/format'
import { cn } from '@/utils/cn'

export type CardWidgetVariant = 'premium' | 'credit' | 'standard'

interface CardWidgetProps {
  accountNumber: string
  cardHolder: string
  accountType: string
  balance?: string
  currencySymbol?: string
  variant?: CardWidgetVariant
  className?: string
  /** Shorter card for dense dashboards */
  compact?: boolean
}

const VARIANT_STYLES: Record<CardWidgetVariant, string> = {
  premium: 'bg-gradient-to-br from-gray-900 via-gray-900 to-primary-dark text-white',
  credit: 'bg-gradient-to-br from-sky-400 to-sky-700 text-white',
  standard: 'bg-gradient-to-br from-slate-500 to-slate-700 text-white',
}

export default function CardWidget({
  accountNumber,
  cardHolder,
  accountType,
  balance,
  currencySymbol = '$',
  variant = 'premium',
  className,
  compact,
}: CardWidgetProps) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden',
        compact
          ? 'flex max-w-xs flex-col rounded-xl p-3'
          : 'flex max-w-[26.5rem] flex-col rounded-2xl p-6 shadow-lg aspect-[85.6/54]',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {/* Background texture */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div
        className={cn(
          'relative z-10 flex min-h-0 flex-1 flex-col',
          compact ? '' : 'justify-between',
        )}
      >
        {/* Top row */}
        <div className={cn('flex items-start justify-between', compact ? 'mb-3' : 'mb-0')}>
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-widest">{accountType}</p>
            <p className="text-[9px] font-semibold text-white/70 mt-0.5">VISA</p>
            {balance && (
              <p
                className={cn(
                  'text-white font-bold mt-0.5',
                  compact ? 'text-base' : 'text-xl',
                )}
              >
                {currencySymbol}
                {parseFloat(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <div
            className={cn(
              'rounded-full border-2 border-white/30 flex items-center justify-center opacity-70',
              compact ? 'w-6 h-6' : 'w-8 h-8',
            )}
          >
            <div
              className={cn('rounded-full border-2 border-white/50', compact ? 'w-3 h-3' : 'w-4 h-4')}
            />
          </div>
        </div>

        {/* Card chip */}
        <div
          className={cn(
            'rounded bg-accent/80',
            compact ? 'mb-2 h-5 w-8' : 'mb-0 h-8 w-12',
          )}
        />

        {/* Number */}
        <p
          className={cn(
            'font-mono tracking-[0.2em] text-white/80',
            compact ? 'mb-2 text-xs' : 'mb-0 text-base',
          )}
        >
          {maskAccountNumber(accountNumber)}
        </p>

        {/* Bottom row */}
        <div className={cn('flex items-end justify-between', compact ? '' : 'pt-1')}>
          <div>
            <p className="text-white/40 text-[9px] uppercase tracking-wider">Card Holder</p>
            <p className="text-white text-xs font-semibold uppercase tracking-wider">{cardHolder}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[9px] uppercase tracking-wider">Account</p>
            <p className="text-white text-xs font-mono">{accountNumber.slice(-4)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

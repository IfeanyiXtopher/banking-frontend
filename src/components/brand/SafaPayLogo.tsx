import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { BANK_LOGO_WORDMARK, BANK_TAGLINE } from '@/lib/brand'

const LOGO_MARK_SRC = '/brand/safapay-mark.png'

const SIZES = {
  sm: { mark: 'h-8 w-8', name: 'text-sm', tagline: 'text-[11px]', gap: 'gap-2' },
  md: { mark: 'h-10 w-10', name: 'text-base', tagline: 'text-xs', gap: 'gap-2.5' },
  lg: { mark: 'h-12 w-12', name: 'text-lg', tagline: 'text-sm', gap: 'gap-3' },
} as const

/** Growth mark — blue bars with lime accent (transparent PNG). */
export function SafaPayIcon({ className }: { className?: string }) {
  return (
    <img
      src={LOGO_MARK_SRC}
      alt=""
      className={cn('flex-shrink-0 object-contain', className)}
      aria-hidden
    />
  )
}

type SafaPayLogoProps = {
  /** `light` = on dark green UI; `dark` = on white/light backgrounds. */
  variant?: 'light' | 'dark'
  size?: keyof typeof SIZES
  showName?: boolean
  showTagline?: boolean
  /** Show slogan only from this breakpoint upward (saves header space on small screens). */
  taglineFrom?: 'sm' | 'md' | 'lg'
  className?: string
  to?: string | null
}

export default function SafaPayLogo({
  variant = 'light',
  size = 'md',
  showName = true,
  showTagline = true,
  taglineFrom,
  className,
  to = '/',
}: SafaPayLogoProps) {
  const s = SIZES[size]
  const nameClass =
    variant === 'light'
      ? 'font-bold text-white tracking-tight'
      : 'font-bold text-primary-dark tracking-tight'
  const taglineClass =
    variant === 'light'
      ? 'font-display text-accent italic font-medium tracking-[0.22em] drop-shadow-sm'
      : 'font-display text-primary-light italic font-medium tracking-[0.22em]'

  const content = (
    <div className={cn('flex min-w-0 items-center', s.gap, className)}>
      <SafaPayIcon className={s.mark} />
      {(showName || showTagline) && (
        <div className="min-w-0 leading-tight">
          {showName ? (
            <span className={cn('block truncate', s.name, nameClass)}>{BANK_LOGO_WORDMARK}</span>
          ) : null}
          {showTagline ? (
            <span
              className={cn(
                'mt-1 block max-w-[14rem] leading-snug',
                taglineFrom === 'sm' && 'hidden sm:block',
                taglineFrom === 'md' && 'hidden md:block',
                taglineFrom === 'lg' && 'hidden lg:block',
                s.tagline,
                taglineClass,
              )}
            >
              {BANK_TAGLINE}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className={cn(
          'inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          variant === 'light' && 'focus-visible:ring-offset-primary-dark',
        )}
      >
        {content}
      </Link>
    )
  }

  return content
}

import { BANK_TAGLINE } from '@/lib/brand'
import { cn } from '@/utils/cn'

const TAGLINE_PARTS = BANK_TAGLINE.split(',').map((part, i, arr) => {
  const trimmed = part.trim()
  if (i < arr.length - 1) return `${trimmed},`
  return trimmed
})

type AuthAnimatedTaglineProps = {
  variant?: 'light' | 'dark'
  className?: string
}

/** Brand tagline with a gentle staggered pulse (auth split panel + mobile footer). */
export default function AuthAnimatedTagline({ variant = 'light', className }: AuthAnimatedTaglineProps) {
  return (
    <p
      className={cn(
        'font-display text-sm italic tracking-[0.2em]',
        variant === 'light' ? 'text-accent/90' : 'text-primary-light',
        className,
      )}
      aria-label={BANK_TAGLINE}
    >
      {TAGLINE_PARTS.map((part, index) => (
        <span
          key={part}
          className="auth-tagline-word inline-block"
          style={{ animationDelay: `${index * 1.1}s` }}
        >
          {part}
          {index < TAGLINE_PARTS.length - 1 ? '\u00a0' : ''}
        </span>
      ))}
    </p>
  )
}

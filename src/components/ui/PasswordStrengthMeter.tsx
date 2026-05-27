import { cn } from '@/utils/cn'

interface PasswordStrengthMeterProps {
  password: string
  compact?: boolean
}

function getStrength(password: string): { level: number; label: string } {
  if (!password) return { level: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { level: 1, label: 'Weak' }
  if (score <= 3) return { level: 2, label: 'Fair' }
  if (score <= 4) return { level: 3, label: 'Strong' }
  return { level: 4, label: 'Very Strong' }
}

const COLORS = ['', 'bg-red-400', 'bg-yellow-400', 'bg-accent', 'bg-green-500']
const TEXT_COLORS = ['', 'text-red-500', 'text-yellow-500', 'text-accent-dark', 'text-green-600']

export default function PasswordStrengthMeter({ password, compact }: PasswordStrengthMeterProps) {
  const { level, label } = getStrength(password)
  if (!password) return null

  const bars = (
    <div className={cn('flex flex-1', compact ? 'gap-0.5' : 'gap-1')}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'flex-1 rounded-full transition-colors duration-300',
            compact ? 'h-0.5' : 'h-1',
            i <= level ? COLORS[level] : 'bg-gray-200',
          )}
        />
      ))}
    </div>
  )

  if (compact) {
    return (
      <div className="mt-1 flex items-center gap-2">
        {bars}
        <p className={cn('shrink-0 text-[10px] font-medium', TEXT_COLORS[level])}>{label}</p>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <div className="mb-1">{bars}</div>
      <p className={cn('text-xs font-medium', TEXT_COLORS[level])}>{label} password</p>
    </div>
  )
}

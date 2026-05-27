import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { LocationOption } from '@/lib/locationData'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  options: LocationOption[]
  error?: string
  placeholder?: string
  hint?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  inputClassName?: string
  /** When picking from the list, store the country name instead of ISO code. */
  preferLabel?: boolean
}

export function LocationCombobox({
  label,
  value,
  onChange,
  options,
  error,
  placeholder,
  hint = 'Type freely or choose from suggestions',
  disabled,
  loading,
  className,
  inputClassName,
  preferLabel = false,
}: Props) {
  const safeValue = value ?? ''
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = safeValue.trim().toLowerCase()
    if (!q) return options.slice(0, 50)
    return options
      .filter(
        (o) =>
          o.label.toLowerCase().includes(q) ||
          o.value.toLowerCase().includes(q),
      )
      .slice(0, 50)
  }, [safeValue, options])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <div ref={rootRef} className={cn('relative space-y-1', className)}>
      {label ? <label className="block text-sm font-medium text-gray-700">{label}</label> : null}
      <div className="relative">
        <input
          type="text"
          value={safeValue}
          disabled={disabled || loading}
          placeholder={loading ? 'Loading locations…' : placeholder}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className={cn(
            'input-field w-full pr-10',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
            inputClassName,
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || loading}
          onClick={() => setOpen((o) => !o)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 disabled:opacity-40"
          aria-label="Show suggestions"
        >
          <ChevronDown size={18} strokeWidth={2} className={cn(open && 'rotate-180 transition-transform')} />
        </button>
      </div>
      {open && !disabled && !loading && filtered.length > 0 ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtered.map((opt) => (
            <li key={`${opt.value}-${opt.label}`} role="option">
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-emerald-50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const next = preferLabel
                    ? opt.label.replace(/\s*\([A-Z]{2}\)\s*$/i, '').trim()
                    : opt.value
                  onChange(next)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {hint && !error ? <p className="text-[11px] text-gray-400">{hint}</p> : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  )
}

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

export const selectShell =
  'group relative rounded-xl border border-gray-200/90 bg-white shadow-sm transition-[border-color,box-shadow] hover:border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'

type StyledSelectProps = {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>

export const StyledSelect = forwardRef<HTMLSelectElement, StyledSelectProps>(function StyledSelect(
  { label, error, className, children, id, disabled, ...selectProps },
  ref,
) {
  const selectId = id ?? selectProps.name

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={selectId}
        className={cn(
          'block text-xs font-semibold uppercase tracking-wide text-gray-500',
          disabled && 'opacity-60',
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          selectShell,
          error && 'border-red-300 focus-within:border-red-400 focus-within:ring-red-100',
          disabled && 'cursor-not-allowed bg-gray-50/80 opacity-70 shadow-none hover:border-gray-200/90',
        )}
      >
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={cn(
            'w-full cursor-pointer appearance-none rounded-xl bg-transparent py-3 pl-4 pr-11 text-sm font-medium text-gray-900',
            'focus:outline-none disabled:cursor-not-allowed',
            !selectProps.value && selectProps.value !== 0 && 'text-gray-500',
          )}
          {...selectProps}
        >
          {children}
        </select>
        <span
          className={cn(
            'pointer-events-none absolute inset-y-0 right-3.5 flex w-5 items-center justify-center rounded-md bg-gray-50 text-gray-500',
            'transition-colors group-focus-within:bg-primary-dark/5 group-focus-within:text-primary-dark',
            disabled && 'bg-transparent text-gray-400',
          )}
          aria-hidden
        >
          <ChevronDown size={16} strokeWidth={2.25} />
        </span>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
})

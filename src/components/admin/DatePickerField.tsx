import { Fragment, useState } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { addMonths, format, getDaysInMonth, isSameMonth, startOfMonth, subMonths } from 'date-fns'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { isSameCalendarDay } from '@/lib/dateRangePresets'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type Props = {
  label: string
  value: Date | null
  onChange: (date: Date) => void
  placeholder?: string
}

export default function DatePickerField({ label, value, onChange, placeholder }: Props) {
  const [month, setMonth] = useState(() => startOfMonth(value ?? new Date()))

  const display = value ? format(value, 'dd MMM yyyy') : placeholder ?? label

  const pickDay = (day: Date, close: () => void) => {
    onChange(day)
    close()
  }

  const start = startOfMonth(month)
  const daysInMonth = getDaysInMonth(month)
  const startWeekday = start.getDay()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <PopoverButton className="input-field inline-flex h-11 min-w-[9rem] items-center gap-2 py-2 text-left text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
            <span className={cn('truncate', !value && 'text-gray-400')}>{display}</span>
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <PopoverPanel
              anchor="bottom start"
              className="z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg [--anchor-gap:4px]"
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded p-1 hover:bg-gray-100"
                  onClick={() => setMonth(subMonths(month, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-500" />
                </button>
                <span className="text-sm font-semibold text-gray-800">{format(month, 'MMMM yyyy')}</span>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-gray-100"
                  onClick={() => setMonth(addMonths(month, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-medium text-gray-400">
                {WEEKDAYS.map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 text-center text-sm">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} className="h-8" />
                  const selected = value && isSameCalendarDay(day, value)
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={!isSameMonth(day, month)}
                      onClick={() => pickDay(day, close)}
                      className={cn(
                        'h-8 w-8 rounded-md text-gray-700 hover:bg-gray-100',
                        !isSameMonth(day, month) && 'invisible',
                        selected && 'bg-primary text-white hover:bg-primary',
                      )}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

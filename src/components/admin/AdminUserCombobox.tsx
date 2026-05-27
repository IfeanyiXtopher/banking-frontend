import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, X } from 'lucide-react'
import { adminApi } from '@/api/admin'
import { fromAdminListResponse } from '@/lib/adminList'
import { cn } from '@/utils/cn'
import Spinner from '@/components/ui/Spinner'

export type AdminUserOption = {
  id: string
  full_name: string
  email: string
}

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function AdminUserCombobox({
  value,
  onChange,
  placeholder = 'Filter by user…',
  className,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selected, setSelected] = useState<AdminUserOption | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(input.trim()), 300)
    return () => window.clearTimeout(t)
  }, [input])

  const { data, isFetching } = useQuery({
    queryKey: ['admin-users-picker', debouncedSearch],
    queryFn: () =>
      adminApi.users({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        page_size: '25',
      }),
    enabled: open,
  })

  const users = fromAdminListResponse<AdminUserOption>(data)

  useEffect(() => {
    if (!value) {
      setSelected(null)
      if (!open) setInput('')
    }
  }, [value, open])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const displayValue = selected ? `${selected.full_name} (${selected.email})` : input

  const handleInputChange = (text: string) => {
    setInput(text)
    setSelected(null)
    setOpen(true)
  }

  useEffect(() => {
    if (selected) return
    if (!input.trim()) {
      if (value) onChange('')
      return
    }
    onChange(input.trim())
  }, [debouncedSearch, selected, input, onChange, value])

  const pickUser = (user: AdminUserOption) => {
    setSelected(user)
    setInput('')
    onChange(user.id)
    setOpen(false)
  }

  const clear = () => {
    setSelected(null)
    setInput('')
    onChange('')
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={cn('relative w-56', className)}>
      <div className="relative">
        <input
          type="text"
          value={open && !selected ? input : displayValue}
          placeholder={placeholder}
          autoComplete="off"
          className="input-field h-11 w-full py-2 pr-16 text-sm"
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setOpen(true)
            if (selected) {
              setInput(selected.email)
              setSelected(null)
            }
          }}
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          {value ? (
            <button
              type="button"
              onClick={clear}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Clear user filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setOpen((o) => !o)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Show users"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {isFetching ? (
            <li className="flex justify-center py-4">
              <Spinner className="h-5 w-5" />
            </li>
          ) : users.length === 0 ? (
            <li className="px-3 py-2 text-xs text-gray-500">No users found. Try another search.</li>
          ) : (
            users.map((user) => (
              <li key={user.id} role="option">
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickUser(user)}
                >
                  <p className="truncate text-sm font-medium text-gray-900">{user.full_name || '—'}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}

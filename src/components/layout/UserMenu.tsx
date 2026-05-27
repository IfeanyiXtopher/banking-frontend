import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getMediaUrl } from '@/lib/mediaUrl'
import { cn } from '@/utils/cn'

type UserMenuProps = {
  /** Compact: avatar + chevron only on small screens; name hidden below `sm`. */
  compact?: boolean
}

export default function UserMenu({ compact = false }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const avatarUrl = getMediaUrl(user?.profile_picture)

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [avatarUrl])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-gray-100',
          compact ? 'pr-1.5' : 'sm:pr-3',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatarUrl && !avatarLoadFailed ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
        )}
        {!compact ? (
          <div className="hidden min-w-0 text-left sm:block">
            <p className="max-w-[140px] truncate text-sm font-medium leading-tight text-gray-800">{user?.full_name}</p>
            <p className="text-xs capitalize leading-tight text-gray-400">{user?.role?.toLowerCase().replace('_', ' ')}</p>
          </div>
        ) : null}
        <ChevronDown size={14} className={cn('shrink-0 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                navigate('/settings')
                setOpen(false)
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              Profile & Settings
            </button>
            {user?.role !== 'CUSTOMER' ? (
              <button
                type="button"
                onClick={() => {
                  navigate('/admin')
                  setOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Admin Portal
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}

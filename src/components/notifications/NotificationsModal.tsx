import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { notificationsApi, type AppNotification } from '@/api/notifications'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/utils/cn'
import { formatRelativeTime } from '@/utils/format'

async function acknowledgeNotification(n: AppNotification) {
  if (n.is_read) return
  await notificationsApi.markRead(n.id)
}

type NotificationsModalProps = {
  open: boolean
  onClose: () => void
}

export default function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  const queryClient = useQueryClient()
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    enabled: open,
  })

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const patchList = (updater: (prev: AppNotification[]) => AppNotification[]) => {
    queryClient.setQueryData(['notifications'], (old: AppNotification[] | undefined) => updater(old ?? []))
  }

  const onOpenNotification = async (n: AppNotification) => {
    if (n.is_read) return
    try {
      await acknowledgeNotification(n)
      patchList((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)))
    } catch {
      toast.error('Could not update notification.')
    }
  }

  const onMarkAllRead = async () => {
    const unread = items.filter((n) => !n.is_read)
    if (unread.length === 0) return
    try {
      await notificationsApi.markAllRead()
      patchList((prev) => prev.map((x) => ({ ...x, is_read: true })))
      toast.success('All notifications marked as read.')
    } catch {
      toast.error('Something went wrong.')
    }
  }

  const onDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await notificationsApi.delete(id)
      patchList((prev) => prev.filter((x) => x.id !== id))
      toast.success('Notification removed.')
    } catch {
      toast.error('Could not delete notification.')
    }
  }

  const unreadCount = items.filter((n) => !n.is_read).length

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-[1px] transition-opacity"
        aria-label="Close notifications"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-modal-title"
        className={cn(
          'fixed z-[101] flex max-h-[min(calc(100dvh-4.5rem),560px)] flex-col overflow-hidden',
          'w-[min(calc(100vw-1.5rem),26rem)] sm:w-[min(calc(100vw-3rem),28rem)]',
          'top-14 right-3 sm:right-6 lg:right-8',
          'rounded-2xl border border-gray-200/90 bg-white shadow-2xl ring-1 ring-black/5',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="notifications-modal-title" className="text-lg font-bold text-gray-900 sm:text-xl">
              Notifications
            </h2>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void onMarkAllRead()}
                className="mt-1.5 text-left text-xs font-semibold text-primary-dark hover:underline sm:text-sm"
              >
                Mark all as read
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-100 bg-red-50/80 py-10 text-center text-sm text-red-700">
              Could not load notifications.
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50/80 py-12 text-center text-sm text-gray-500">
              No notifications.
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Notification list">
              {items.map((n) => (
                <li key={n.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => void onOpenNotification(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        void onOpenNotification(n)
                      }
                    }}
                    className={cn(
                      'rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm outline-none transition-shadow',
                      'focus-visible:ring-2 focus-visible:ring-primary/25',
                      !n.is_read ? 'border-l-4 border-l-accent shadow-md' : 'hover:shadow-md',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            n.is_read ? 'font-normal text-gray-600' : 'font-semibold text-gray-900',
                          )}
                        >
                          {n.subject}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(n.sent_at)}</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">{n.body}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => void onDelete(e, n.id)}
                        className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={18} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

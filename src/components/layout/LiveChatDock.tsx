import { MessageCircle, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useLiveChat } from '@/contexts/LiveChatContext'
import { cn } from '@/utils/cn'

export default function LiveChatDock() {
  const { open, setOpen, toggle } = useLiveChat()
  const isDashboard = useLocation().pathname === '/dashboard'

  return (
    <>
      {/* Desktop / tablet: floating launcher */}
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'fixed z-50 flex h-14 w-14 items-center justify-center rounded-full',
          'bg-accent text-primary-dark',
          'shadow-[0_4px_20px_rgba(200,240,0,0.55),0_2px_8px_rgba(0,0,0,0.25)]',
          'ring-2 ring-white ring-offset-2 ring-offset-primary-dark/30',
          'transition-transform hover:scale-110 hover:bg-accent-light',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-primary-dark',
          'max-lg:hidden',
          isDashboard ? 'bottom-20 right-6' : 'bottom-6 right-6',
        )}
        aria-label={open ? 'Close live chat' : 'Open live chat'}
      >
        <span
          className={cn(
            'flex items-center justify-center',
            !open && 'animate-live-chat-bounce motion-reduce:animate-none',
          )}
          aria-hidden
        >
          <MessageCircle size={26} strokeWidth={2.25} className="text-primary-dark" />
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/30 lg:bg-transparent"
            aria-label="Close chat overlay"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              'fixed z-[60] flex max-h-[min(420px,70vh)] w-full flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-2xl',
              'bottom-0 left-0 right-0 max-lg:max-h-[min(480px,85vh)]',
              'lg:bottom-24 lg:right-6 lg:left-auto lg:w-[380px] lg:rounded-2xl',
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-chat-title"
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-primary-dark px-4 py-3 text-white">
              <div>
                <h2 id="live-chat-title" className="text-sm font-semibold">
                  Live chat
                </h2>
                <p className="text-[11px] text-white/60">We typically reply in a few minutes</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-4">
              <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
                Hi — you’re connected to SafaPay Bank support. How can we help you today?
              </div>
              <p className="text-center text-xs text-gray-400">Demo: messaging is not connected to a real agent.</p>
            </div>
            <div className="border-t border-gray-100 bg-white p-3">
              <input
                type="text"
                readOnly
                placeholder="Type a message…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
              />
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}

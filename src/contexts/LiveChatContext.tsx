import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { openTawkChat } from '@/lib/tawk'

type LiveChatContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const LiveChatContext = createContext<LiveChatContextValue | null>(null)

export function LiveChatProvider({ children }: { children: ReactNode }) {
  const setOpen = useCallback((next: boolean) => {
    if (next) void openTawkChat()
  }, [])

  const toggle = useCallback(() => {
    void openTawkChat()
  }, [])

  const value = useMemo(
    () => ({
      open: false,
      setOpen,
      toggle,
    }),
    [setOpen, toggle],
  )

  return <LiveChatContext.Provider value={value}>{children}</LiveChatContext.Provider>
}

export function useLiveChat() {
  const ctx = useContext(LiveChatContext)
  if (!ctx) {
    throw new Error('useLiveChat must be used within LiveChatProvider')
  }
  return ctx
}

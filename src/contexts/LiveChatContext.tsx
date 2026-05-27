import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type LiveChatContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const LiveChatContext = createContext<LiveChatContextValue | null>(null)

export function LiveChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
    }),
    [open, toggle],
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

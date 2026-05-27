import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PageToolbarProps } from '@/components/layout/PageToolbar'

export type PageChromeOverride = Partial<Pick<PageToolbarProps, 'showBack' | 'backLabel' | 'backTo' | 'onBack'>>

type PageChromeContextValue = {
  override: PageChromeOverride | null
  setOverride: (value: PageChromeOverride | null) => void
}

const PageChromeContext = createContext<PageChromeContextValue | null>(null)

export function PageChromeProvider({ children }: { children: ReactNode }) {
  const [override, setOverride] = useState<PageChromeOverride | null>(null)
  const value = useMemo(() => ({ override, setOverride }), [override])
  return <PageChromeContext.Provider value={value}>{children}</PageChromeContext.Provider>
}

function usePageChromeContext() {
  const ctx = useContext(PageChromeContext)
  if (!ctx) throw new Error('usePageChromeContext must be used within PageChromeProvider')
  return ctx
}

/** Let a page customize the shared toolbar (back label, handler, visibility). */
export function usePageChrome(chrome: PageChromeOverride | null) {
  const { setOverride } = usePageChromeContext()
  const hasChrome = chrome != null
  const showBack = chrome?.showBack
  const backLabel = chrome?.backLabel
  const backTo = chrome?.backTo
  const onBack = chrome?.onBack

  useEffect(() => {
    if (!hasChrome) {
      setOverride(null)
      return
    }
    setOverride({ showBack, backLabel, backTo, onBack })
    return () => setOverride(null)
    // Primitives only — callers often pass a fresh `chrome` object each render.
  }, [hasChrome, showBack, backLabel, backTo, onBack, setOverride])
}

export function usePageChromeOverride() {
  const ctx = useContext(PageChromeContext)
  return ctx?.override ?? null
}

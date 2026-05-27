import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes

export function useInactivityLogout() {
  const { logout, isAuthenticated } = useAuth()
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!isAuthenticated) return

    const resetTimer = () => {
      clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        logout()
      }, INACTIVITY_TIMEOUT_MS)
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [isAuthenticated, logout])
}

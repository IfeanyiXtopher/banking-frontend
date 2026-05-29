import { useEffect, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/queryClient'
import toast from 'react-hot-toast'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null)
  const { isAuthenticated, accessToken } = useAuthStore()
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>()

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) return
    if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
      return
    }

    ws.current = new WebSocket(`${WS_URL}/ws/updates/?token=${accessToken}`)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'notification') {
          const n = data.notification
          if (!n?.event_type || n.event_type === 'MFA_OTP') return
          void queryClient.invalidateQueries({ queryKey: ['notifications'] })
          const message = [n.subject, n.body].filter(Boolean).join(' — ')
          toast(message || 'New notification', { icon: '🔔', duration: 5000 })
        }
        if (data.type === 'balance_update') {
          // Trigger account refetch via query invalidation
          window.dispatchEvent(new CustomEvent('balance-update', { detail: data }))
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.current.onclose = () => {
      reconnectTimeout.current = setTimeout(connect, 5000)
    }

    ws.current.onerror = () => {
      ws.current?.close()
    }
  }, [isAuthenticated, accessToken])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimeout.current)
      const socket = ws.current
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close()
      }
      ws.current = null
    }
  }, [connect])

  return ws
}

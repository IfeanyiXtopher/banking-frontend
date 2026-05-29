import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { loadTawk, setTawkVisitorAttributes } from '@/lib/tawk'

/** Loads Tawk.to once for the whole SPA (landing, auth, app, admin). */
export default function TawkToWidget() {
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    void loadTawk()
  }, [])

  useEffect(() => {
    if (!user?.email) return
    void setTawkVisitorAttributes({
      name: user.full_name,
      email: user.email,
    })
  }, [user?.email, user?.full_name])

  return null
}

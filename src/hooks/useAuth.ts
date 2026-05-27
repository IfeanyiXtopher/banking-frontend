import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { queryClient } from '@/queryClient'
import toast from 'react-hot-toast'

export type StaffLoginOptions = { staffOnly?: boolean }

function resolveAfterLogin(
  profile: {
    requires_profile_setup?: boolean
    role: string
  },
  options?: StaffLoginOptions,
): '/complete-profile' | '/admin' | '/dashboard' | 'BLOCKED_CUSTOMER' {
  if (profile.requires_profile_setup) return '/complete-profile'
  if (options?.staffOnly) {
    if (profile.role === 'CUSTOMER') return 'BLOCKED_CUSTOMER'
    return '/admin'
  }
  return '/dashboard'
}

export function useAuth() {
  const { user, isAuthenticated, accessToken, refreshToken, setTokens, setUser, logout: storeLogout } = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(
    async (email: string, password: string, options?: StaffLoginOptions) => {
      const response = await authApi.login({ email, password })
      if (response.data.mfa_required) {
        navigate('/auth/mfa', { state: { email, staffOnly: options?.staffOnly } })
        return { mfaRequired: true, email }
      }
      setTokens(response.data.access, response.data.refresh)
      const profileRes = await authApi.getProfile()
      setUser(profileRes.data)
      queryClient.clear()
      const dest = resolveAfterLogin(profileRes.data, options)
      if (dest === 'BLOCKED_CUSTOMER') {
        storeLogout()
        queryClient.clear()
        toast.error('This sign-in is for staff and administrators. Use the customer sign-in for personal accounts.')
        return { mfaRequired: false }
      }
      navigate(dest)
      return { mfaRequired: false }
    },
    [setTokens, setUser, navigate, storeLogout],
  )

  const completeMFA = useCallback(
    async (email: string, token: string, mfa_type: 'totp' | 'email', options?: StaffLoginOptions) => {
      const response = await authApi.mfaVerify({ email, token, mfa_type })
      setTokens(response.data.access, response.data.refresh)
      const profileRes = await authApi.getProfile()
      setUser(profileRes.data)
      queryClient.clear()
      const dest = resolveAfterLogin(profileRes.data, options)
      if (dest === 'BLOCKED_CUSTOMER') {
        storeLogout()
        queryClient.clear()
        toast.error('This sign-in is for staff and administrators. Use the customer sign-in for personal accounts.')
        navigate('/admin/login', { replace: true })
        return
      }
      navigate(dest)
    },
    [setTokens, setUser, navigate, storeLogout],
  )

  const logout = useCallback(async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {
      // ignore
    }
    storeLogout()
    navigate('/auth/signin')
  }, [refreshToken, storeLogout, navigate])

  const refreshProfile = useCallback(async (): Promise<boolean> => {
    try {
      const res = await authApi.getProfile()
      setUser(res.data)
      return true
    } catch {
      return false
    }
  }, [setUser])

  return { user, isAuthenticated, accessToken, login, completeMFA, logout, refreshProfile }
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, ShieldCheck, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import PageShell from '@/components/layout/PageShell'
import { Input } from '@/components/forms/Input'
import Spinner from '@/components/ui/Spinner'
import { SettingsToggle } from '@/components/settings/SettingsControls'
import { cn } from '@/utils/cn'

export default function SettingsSecurityPage() {
  const user = useAuthStore((s) => s.user)
  const { refreshProfile } = useAuth()
  const queryClient = useQueryClient()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mfaLoading, setMfaLoading] = useState(false)

  const passwordMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      }),
    onSuccess: () => {
      toast.success('Password updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      const msg = detail?.detail || detail?.current_password?.[0] || detail?.new_password?.[0]
      toast.error(typeof msg === 'string' ? msg : 'Could not change password.')
    },
  })

  const toggleMFA = async () => {
    setMfaLoading(true)
    try {
      await authApi.toggleMFA()
      toast.success(`Two-factor ${user?.is_mfa_enabled ? 'disabled' : 'enabled'}.`)
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await refreshProfile()
    } catch {
      toast.error('Could not update two-factor authentication.')
    } finally {
      setMfaLoading(false)
    }
  }

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    passwordMutation.mutate()
  }

  return (
    <PageShell
      badge="Settings"
      title="Security & privacy"
      backTo="/settings"
      description={
        <div className="space-y-2">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Link to="/settings" className="transition-colors hover:text-primary-dark">
              All settings
            </Link>
            <ChevronRight size={12} className="text-gray-300" aria-hidden />
            <span className="text-gray-700">Security</span>
          </nav>
          <p className="text-sm leading-relaxed text-gray-600">
            Protect your sign-in with a strong password and two-factor authentication.
          </p>
        </div>
      }
      contentClassName="!space-y-6"
    >
      <section className="settings-panel">
        <div className="flex items-start gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-5 sm:px-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-dark/10 text-primary-dark">
            <ShieldCheck size={22} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-gray-900">Two-factor authentication</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              Adds a second step when you sign in — we recommend keeping this on.
            </p>
          </div>
        </div>
        <div className="settings-panel-pad flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Authenticator / email MFA</p>
            <p className="mt-0.5 text-sm text-gray-500">
              {user?.is_mfa_enabled ? 'Currently enabled on your account' : 'Not enabled — your account is easier to access'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {mfaLoading && <Spinner size="sm" />}
            <SettingsToggle
              checked={Boolean(user?.is_mfa_enabled)}
              onChange={toggleMFA}
              disabled={mfaLoading}
            />
          </div>
        </div>
      </section>

      <section className="settings-panel">
        <div className="flex items-start gap-4 border-b border-gray-100 bg-gray-50/50 px-6 py-5 sm:px-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900/5 text-primary-dark">
            <KeyRound size={22} strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-gray-900">Change password</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">Use a unique password you do not reuse elsewhere.</p>
          </div>
        </div>
        <form onSubmit={submitPassword} className="settings-panel-pad space-y-4">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className={cn('btn-primary inline-flex items-center justify-center gap-2 px-8 py-2.5 text-sm')}
          >
            {passwordMutation.isPending ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>
    </PageShell>
  )
}

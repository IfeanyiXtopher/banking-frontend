import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { AuthFormCard, AuthFormHeader } from '@/components/auth/AuthFormShell'
import SplitAuthLayout from '@/components/layout/SplitAuthLayout'
import { Input } from '@/components/forms/Input'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

export default function MFAVerifyPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { completeMFA } = useAuth()
  const { state } = useLocation() as { state?: { email?: string; staffOnly?: boolean } }
  const navigate = useNavigate()
  const email = state?.email || ''
  const staffOnly = Boolean(state?.staffOnly)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || code.length < 4) {
      toast.error('Enter the verification code.')
      return
    }
    setLoading(true)
    try {
      await completeMFA(email, code, 'email', staffOnly ? { staffOnly: true } : undefined)
    } catch {
      toast.error('Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SplitAuthLayout>
      <AuthFormCard>
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-dark to-primary shadow-lg ring-4 ring-primary-dark/10">
            <ShieldCheck className="h-7 w-7 text-accent" strokeWidth={1.75} aria-hidden />
          </div>
        </div>

        <AuthFormHeader
          centered
          title="Verify your identity"
          subtitle={
            email
              ? `Enter the 6-digit code we sent to ${email}.`
              : 'Enter the 6-digit verification code from your email.'
          }
        />

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Verification code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center font-mono text-2xl tracking-[0.45em]"
          />

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {loading && <Spinner size="sm" className="border-white border-t-white/30" />}
            Verify & continue
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            className="font-semibold text-primary-dark transition-colors hover:text-primary"
            onClick={() => navigate(staffOnly ? '/admin/login' : '/auth/signin')}
          >
            Back to sign in
          </button>
        </p>
      </AuthFormCard>
    </SplitAuthLayout>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import {
  AuthBackLink,
  AuthFooterLink,
  AuthFormCard,
  AuthFormHeader,
} from '@/components/auth/AuthFormShell'
import SplitAuthLayout from '@/components/layout/SplitAuthLayout'
import { Input } from '@/components/forms/Input'
import Spinner from '@/components/ui/Spinner'
import { authApi } from '@/api/auth'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authApi.requestPasswordReset(data.email)
      navigate('/auth/check-email', { state: { email: data.email } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SplitAuthLayout>
      <AuthFormCard>
        <AuthBackLink to="/auth/signin" label="Back to sign in" />
        <AuthFormHeader
          title="Reset your password"
          subtitle="Enter the email on your account and we'll send you a secure link to choose a new password."
        />

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary-dark/10 bg-primary-dark/[0.04] px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/25 text-primary-dark">
            <Mail className="h-5 w-5" aria-hidden />
          </span>
          <p className="text-xs leading-relaxed text-gray-600">
            Check your spam folder if you don&apos;t see the message within a few minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
            {loading && <Spinner size="sm" className="border-white border-t-white/30" />}
            Send reset link
          </button>
        </form>

        <AuthFooterLink prompt="Remember your password?" linkLabel="Sign in" to="/auth/signin" />
      </AuthFormCard>
    </SplitAuthLayout>
  )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Shield } from 'lucide-react'
import {
  AuthBackLink,
  AuthFooterLink,
  AuthFormCard,
  AuthFormHeader,
} from '@/components/auth/AuthFormShell'
import SplitAuthLayout from '@/components/layout/SplitAuthLayout'
import { Input, PasswordInput } from '@/components/forms/Input'
import Spinner from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

/**
 * Staff / superuser entry: same API as customer sign-in, but only non-CUSTOMER roles proceed to /admin.
 * URL: /admin/login
 */
export default function AdminSignInPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !user) return
    if (user.role !== 'CUSTOMER') {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await login(data.email, data.password, { staffOnly: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(typeof msg === 'string' ? msg : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SplitAuthLayout>
      <AuthFormCard>
        <AuthBackLink to="/" label="Back to home" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-dark to-primary shadow-md ring-4 ring-primary-dark/10">
          <Shield className="h-6 w-6 text-accent" strokeWidth={1.75} aria-hidden />
        </div>

        <AuthFormHeader title="Admin sign-in" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Work email"
            type="email"
            placeholder="you@bank.com"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link
                to="/auth/forgot-password"
                className="text-sm font-semibold text-primary-dark transition-colors hover:text-primary"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
            {loading && <Spinner size="sm" className="border-white border-t-white/30" />}
            Sign in to admin
          </button>
        </form>

        <AuthFooterLink prompt="Customer account?" linkLabel="Customer sign-in" to="/auth/signin" />
      </AuthFormCard>
    </SplitAuthLayout>
  )
}

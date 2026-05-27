import { Link, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import {
  AuthBackLink,
  AuthFormCard,
  AuthFormHeader,
} from '@/components/auth/AuthFormShell'
import SplitAuthLayout from '@/components/layout/SplitAuthLayout'

export default function CheckEmailPage() {
  const { state } = useLocation()
  const email = state?.email || 'your email'

  return (
    <SplitAuthLayout>
      <AuthFormCard className="text-center">
        <AuthBackLink to="/auth/signin" label="Back to sign in" />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 ring-4 ring-accent/20">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-dark shadow-md">
            <Mail size={22} className="text-accent" aria-hidden />
          </div>
        </div>

        <AuthFormHeader
          centered
          title="Check your email"
          subtitle={`We've sent a password reset link to ${email}. Open the link to continue — it may take a minute to arrive.`}
        />

        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mb-4 flex w-full items-center justify-center"
        >
          Open mail app
        </a>

        <p className="text-sm text-gray-500">
          Didn&apos;t receive the email?{' '}
          <Link to="/auth/forgot-password" className="font-semibold text-primary-dark hover:text-primary">
            Resend link
          </Link>
        </p>
      </AuthFormCard>
    </SplitAuthLayout>
  )
}

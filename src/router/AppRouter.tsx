import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, Outlet, useParams } from 'react-router-dom'
import { useAuthStore, useAuthReady, markAuthHydrated } from '@/store/authStore'
import Spinner from '@/components/ui/Spinner'
import { authApi } from '@/api/auth'
import { notificationsApi } from '@/api/notifications'
import { queryClient } from '@/queryClient'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'
import { useWebSocket } from '@/hooks/useWebSocket'

// Layouts
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// Auth pages
import SignInPage from '@/pages/auth/SignInPage'
import AdminSignInPage from '@/pages/auth/AdminSignInPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import CheckEmailPage from '@/pages/auth/CheckEmailPage'
import CreateNewPasswordPage from '@/pages/auth/CreateNewPasswordPage'
import MFAVerifyPage from '@/pages/auth/MFAVerifyPage'

// App pages
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TransactionListPage from '@/pages/transactions/TransactionListPage'
import TransferPage from '@/pages/transactions/TransferPage'
import AccountListPage from '@/pages/accounts/AccountListPage'
import AccountDetailPage from '@/pages/accounts/AccountDetailPage'
import SavingsPage from '@/pages/savings/SavingsPage'
import SavingsDetailPage from '@/pages/savings/SavingsDetailPage'
import LoanProductsPage from '@/pages/loans/LoanProductsPage'
import LoanApplyPage from '@/pages/loans/LoanApplyPage'
import LoanDetailPage from '@/pages/loans/LoanDetailPage'
import LoanApplicationPayoutPage from '@/pages/loans/LoanApplicationPayoutPage'
import TicketListPage from '@/pages/support/TicketListPage'
import SettingsLayout from '@/pages/settings/SettingsLayout'
import SettingsHubPage from '@/pages/settings/SettingsHubPage'
import SettingsPersonalPage from '@/pages/settings/SettingsPersonalPage'
import SettingsSecurityPage from '@/pages/settings/SettingsSecurityPage'
import SettingsNotificationsPage from '@/pages/settings/SettingsNotificationsPage'
import SettingsLinkedAccountsPage from '@/pages/settings/SettingsLinkedAccountsPage'
import CardsPage from '@/pages/cards/CardsPage'
import PaymentsPage from '@/pages/payments/PaymentsPage'
import RecurringPaymentsPage from '@/pages/recurring/RecurringPaymentsPage'
// Admin pages
import AdminLayout from '@/components/layout/AdminLayout'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminAccountsPage from '@/pages/admin/AdminAccountsPage'
import AdminTransactionsPage from '@/pages/admin/AdminTransactionsPage'
import AdminLoansPage from '@/pages/admin/AdminLoansPage'
import AdminFeesPage from '@/pages/admin/AdminFeesPage'
import AdminPaymentFeesPage from '@/pages/admin/AdminPaymentFeesPage'
import AdminCardProductsPage from '@/pages/admin/AdminCardProductsPage'
import AdminTicketsPage from '@/pages/admin/AdminTicketsPage'
import AdminAuditPage from '@/pages/admin/AdminAuditPage'
import AdminEmailOtpPage from '@/pages/admin/AdminEmailOtpPage'
import AdminPendingCompliancePage from '@/pages/admin/AdminPendingCompliancePage'
import LandingPage from '@/pages/landing/LandingPage'
import CompleteProfilePage from '@/pages/onboarding/CompleteProfilePage'
import AdminProfileRequestsPage from '@/pages/admin/AdminProfileRequestsPage'
import CompliancePaymentMockPage from '@/pages/dev/CompliancePaymentMockPage'

function AuthHydrationGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      markAuthHydrated()
      return
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      markAuthHydrated()
    })
    const fallback = window.setTimeout(() => {
      markAuthHydrated()
    }, 500)
    return () => {
      unsub()
      window.clearTimeout(fallback)
    }
  }, [])

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  return <>{children}</>
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return (
    <AuthHydrationGate>
      {isAuthenticated ? <>{children}</> : <Navigate to="/auth/signin" replace />}
    </AuthHydrationGate>
  )
}

function AdminEntryRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return (
    <AuthHydrationGate>
      {isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />}
    </AuthHydrationGate>
  )
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/admin/login" replace />
  if (user.role === 'CUSTOMER') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppShell() {
  useInactivityLogout()
  useWebSocket()
  const authReady = useAuthReady()
  const setUser = useAuthStore((s) => s.setUser)
  const didBootstrapRef = useRef(false)

  useEffect(() => {
    if (!authReady) {
      didBootstrapRef.current = false
      return
    }
    if (didBootstrapRef.current) return
    didBootstrapRef.current = true
    authApi.getProfile().then((res) => setUser(res.data)).catch(() => {})
    void queryClient.invalidateQueries()
    void queryClient.prefetchQuery({
      queryKey: ['notifications'],
      queryFn: () => notificationsApi.list(),
    })
  }, [authReady, setUser])

  return <Outlet />
}

function ProfileSetupGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user || user.role !== 'CUSTOMER') return <>{children}</>
  if (user.requires_profile_setup !== true) return <>{children}</>
  if (location.pathname === '/complete-profile') return <>{children}</>
  return <Navigate to="/complete-profile" replace />
}

function SupportNewRedirect() {
  return <Navigate to="/support?new=1" replace />
}

function SupportTicketDeepLink() {
  const { id } = useParams()
  return <Navigate to={`/support?ticket=${encodeURIComponent(id!)}`} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/admin/login" element={<AdminSignInPage />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/check-email" element={<CheckEmailPage />} />
        <Route path="/auth/reset-password" element={<CreateNewPasswordPage />} />
        <Route path="/auth/mfa" element={<MFAVerifyPage />} />
      </Route>

      {/* App routes */}
      <Route
        element={
          <PrivateRoute>
            <AppShell />
          </PrivateRoute>
        }
      >
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route
          element={
            <ProfileSetupGuard>
              <AppLayout />
            </ProfileSetupGuard>
          }
        >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionListPage />} />
        <Route path="/transactions/new" element={<Navigate to="/transactions/transfer" replace />} />
        <Route path="/transactions/transfer" element={<TransferPage />} />
        <Route path="/recurring" element={<RecurringPaymentsPage />} />
        <Route path="/accounts" element={<AccountListPage />} />
        <Route path="/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/savings" element={<SavingsPage />} />
        <Route path="/savings/:id" element={<SavingsDetailPage />} />
        <Route path="/loans" element={<LoanProductsPage />} />
        <Route path="/loans/applications/:applicationId/payout" element={<LoanApplicationPayoutPage />} />
        <Route path="/loans/apply/:applyToken" element={<LoanApplyPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route path="/support" element={<TicketListPage />} />
        <Route path="/support/new" element={<SupportNewRedirect />} />
        <Route path="/support/:id" element={<SupportTicketDeepLink />} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<SettingsHubPage />} />
          <Route path="personal" element={<SettingsPersonalPage />} />
          <Route path="security" element={<SettingsSecurityPage />} />
          <Route path="notifications" element={<SettingsNotificationsPage />} />
          <Route path="linked-accounts" element={<SettingsLinkedAccountsPage />} />
        </Route>
        <Route path="/dev/compliance-payment-mock" element={<CompliancePaymentMockPage />} />
        </Route>
      </Route>

      {/* Admin routes — unauthenticated users go to /admin/login */}
      <Route
        element={
          <AdminEntryRoute>
            <AdminRoute>
              <AppShell />
            </AdminRoute>
          </AdminEntryRoute>
        }
      >
        <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/email-otps" element={<AdminEmailOtpPage />} />
        <Route path="/admin/pending-compliance" element={<AdminPendingCompliancePage />} />
        <Route path="/admin/accounts" element={<AdminAccountsPage />} />
        <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
        <Route path="/admin/loans" element={<AdminLoansPage />} />
        <Route path="/admin/fees" element={<AdminFeesPage />} />
        <Route path="/admin/payment-fees" element={<AdminPaymentFeesPage />} />
        <Route path="/admin/card-products" element={<AdminCardProductsPage />} />
        <Route path="/admin/tickets" element={<AdminTicketsPage />} />
        <Route path="/admin/audit" element={<AdminAuditPage />} />
        <Route path="/admin/profile-requests" element={<AdminProfileRequestsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

# Pages Reference

## Route Map

```
/auth/login                   SignInPage
/auth/register                SignUpPage
/auth/forgot-password         ForgotPasswordPage
/auth/mfa                     MFAVerifyPage

/ (redirect → /dashboard)
/dashboard                    DashboardPage             [PrivateRoute]
/transactions                 TransactionListPage       [PrivateRoute]
/transactions/:id             TransactionDetailPage     [PrivateRoute]
/accounts                     AccountListPage           [PrivateRoute]
/accounts/:id                 AccountDetailPage         [PrivateRoute]
/loans                        LoanListPage              [PrivateRoute]
/loans/products               LoanProductsPage          [PrivateRoute]
/loans/:id                    LoanDetailPage            [PrivateRoute]
/statements                   StatementsPage            [PrivateRoute]
/support                      SupportListPage           [PrivateRoute]
/support/new                  NewTicketPage             [PrivateRoute]
/support/:id                  TicketDetailPage          [PrivateRoute]
/settings                     SettingsPage              [PrivateRoute]
/settings/security            SecuritySettingsPage      [PrivateRoute]
/settings/notifications       NotificationPrefsPage     [PrivateRoute]

/admin                        AdminDashboardPage        [AdminRoute]
/admin/users                  AdminUsersPage            [AdminRoute]
/admin/users/:id              AdminUserDetailPage       [AdminRoute]
/admin/accounts               AdminAccountsPage         [AdminRoute]
/admin/transactions           AdminTransactionsPage     [AdminRoute]
/admin/loans                  AdminLoansPage            [AdminRoute]
/admin/support                AdminSupportPage          [AdminRoute]
/admin/fees                   AdminFeesPage             [AdminRoute: SUPER_ADMIN]
/admin/audit                  AdminAuditPage            [AdminRoute: COMPLIANCE_AUDITOR]
```

---

## Auth Pages

### `SignInPage` — `/auth/login`

**Purpose:** Email + password login. Redirects to MFA page if required.

**Data flow:**
1. Form submission → `useAuth().login(email, password)`.
2. On success: if `mfa_required`, navigate to `/auth/mfa`; otherwise navigate to `/dashboard`.
3. On failure: show field-level errors from API response.

**Key components:** `SplitAuthLayout`, `Input`, `PasswordInput`, `btn-primary`.

---

### `SignUpPage` — `/auth/register`

**Purpose:** New user registration.

**Data flow:**
1. Form with `react-hook-form` + `zod` validation (password strength, match, email format).
2. `authApi.register(data)` → success banner → navigate to `/auth/login`.

---

### `ForgotPasswordPage` — `/auth/forgot-password`

Two-step UI:
1. Enter email → `authApi.requestPasswordReset(email)` → show "check your inbox" message.
2. After clicking link in email, user lands with `?token=...` in URL → show new password form.

---

### `MFAVerifyPage` — `/auth/mfa`

**Purpose:** Enter 6-digit OTP (TOTP or email).

**Data flow:**
1. Receives `email` from router state.
2. Submits `authApi.verifyMFA(email, token, mfaType)`.
3. On success: stores tokens, navigates to `/dashboard`.

---

## Customer Pages

### `DashboardPage` — `/dashboard`

**Purpose:** Main landing page after login.

**Sections:**
- **Account cards row** — balance, account number, type (`CardWidget`)
- **Quick stats** — total balance, income this month, expenses this month (`StatCard`)
- **Spending chart** — monthly bar chart of debit transactions (`recharts`)
- **Recent transactions** — last 5 transactions (`TransactionRow`)
- **Notifications panel** — unread notifications from sidebar

**Data fetched:**
- `accountsApi.list()` via TanStack Query
- `transactionsApi.list({ page_size: 5 })` via TanStack Query
- Balance updates via WebSocket (`useWebSocket`)

---

### `TransactionListPage` — `/transactions`

**Purpose:** Paginated, filterable transaction history across all accounts.

**Filters:** account, type, status, date range, amount range  
**Sorting:** date (default desc), amount  
**Each row:** `TransactionRow` — icon, description, amount, status badge, date

---

### `TransactionDetailPage` — `/transactions/:id`

Shows full transaction details including reference number, accounts, fee, exchange rate, and timeline.

---

### `AccountListPage` — `/accounts`

Grid of account cards. Each card: account number (masked), type, currency, balance.  
"Open New Account" button → inline modal.

---

### `AccountDetailPage` — `/accounts/:id`

Shows account metadata + filtered transaction list for that account.  
Actions: Request Statement, Freeze (pending admin API), Close Account.

---

### `LoanProductsPage` — `/loans/products`

Grid of available loan products with interest rate, min/max amount, term range.  
"Apply" button opens `LoanApplicationModal`.

---

### `LoanListPage` / `LoanDetailPage`

Lists all loan applications and active loan accounts.  
`LoanDetailPage` shows repayment schedule table and "Make Payment" form.

---

### `StatementsPage` — `/statements`

Lists generated statements. "Request Statement" opens a date-range picker modal.  
Download button fetches PDF blob and triggers browser download.

---

### `SupportListPage` / `TicketDetailPage`

Lists tickets with status/priority badges.  
`TicketDetailPage` is a threaded message view. Customer can add messages and close the ticket.

---

### `SettingsPage` — `/settings`

Tabs:
- **Profile** — edit full name, phone, address, upload profile picture
- **Security** — change password, toggle MFA, view active sessions
- **Notifications** — toggle email alert preferences

---

## Admin Pages

All admin pages use `AdminLayout` with a separate sidebar nav.

### `AdminDashboardPage` — `/admin`

KPI stats: total users, accounts, transaction volume, pending loans, open tickets, flagged transactions.

### `AdminUsersPage` — `/admin/users`

Searchable, filterable user table. Actions per row:
- View detail, change role, lock/unlock, review KYC.

### `AdminTransactionsPage` — `/admin/transactions`

All transactions with filter by type, status, date. Actions: Flag, Reverse.

### `AdminLoansPage` — `/admin/loans`

Pending loan applications. Actions: Approve/Reject with notes, Disburse.

### `AdminFeesPage` — `/admin/fees`

CRUD for `TransactionFee` and `ExchangeRate` records.  
Only visible to `SUPER_ADMIN` role.

### `AdminAuditPage` — `/admin/audit`

Read-only audit log table with actor, action, target, timestamp, and IP address.  
Only visible to `COMPLIANCE_AUDITOR` role.

# SafaPay Bank — Frontend

> React SPA for the SafaPay Bank banking platform.  
> Deployed on Vercel. Backend API lives in `banking-backend`.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Available Scripts](#available-scripts)

---

## Quick Start

**Requirements:** Node 20+, pnpm (or npm)

```bash
# 1. Clone and enter the repo
git clone <your-repo-url> banking-frontend
cd banking-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your API URLs

# 4. Start development server
npm run dev
```

Open http://localhost:5173

---

## Environment Variables

| Variable | Example | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_WS_URL` | `ws://localhost:8000` | WebSocket base URL |

In production, set these in the Vercel project dashboard (Settings → Environment Variables):

| Variable | Production Value |
|---|---|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com` |
| `VITE_WS_URL` | `wss://api.yourdomain.com` |

---

## Project Structure

```
banking-frontend/
├── public/                  # Static assets served as-is
├── src/
│   ├── api/                 # Axios API client and service wrappers
│   │   ├── client.ts        # Axios instance, JWT interceptor, auto-refresh
│   │   ├── auth.ts          # Auth endpoints
│   │   ├── accounts.ts      # Account endpoints
│   │   ├── transactions.ts  # Transaction endpoints
│   │   ├── loans.ts         # Loan endpoints
│   │   ├── statements.ts    # Statement endpoints
│   │   ├── notifications.ts # Notification endpoints
│   │   ├── support.ts       # Support ticket endpoints
│   │   └── admin.ts         # Admin portal endpoints
│   │
│   ├── store/               # Global client state (Zustand)
│   │   ├── authStore.ts     # Auth state (user, tokens, persisted)
│   │   └── notifStore.ts    # Unread notification count
│   │
│   ├── hooks/               # Reusable React hooks
│   │   ├── useAuth.ts       # Login, MFA, logout, profile refresh
│   │   ├── useWebSocket.ts  # WS connection with auto-reconnect
│   │   └── useInactivityLogout.ts  # Client-side auto-logout timer
│   │
│   ├── components/
│   │   ├── layout/          # Page layout wrappers
│   │   │   ├── AuthLayout.tsx         # Minimal wrapper for auth pages
│   │   │   ├── SplitAuthLayout.tsx    # Two-column branded auth layout
│   │   │   ├── Sidebar.tsx            # Fixed left navigation
│   │   │   ├── Header.tsx             # Top bar (search, notifications, user)
│   │   │   ├── AppLayout.tsx          # Main customer app layout
│   │   │   └── AdminLayout.tsx        # Admin portal layout
│   │   │
│   │   ├── ui/              # Reusable display components
│   │   │   ├── StatCard.tsx           # Dashboard KPI card
│   │   │   ├── TransactionRow.tsx     # Single transaction list item
│   │   │   ├── CardWidget.tsx         # Credit/debit card visual
│   │   │   ├── PasswordStrengthMeter.tsx
│   │   │   └── Spinner.tsx
│   │   │
│   │   └── forms/           # Form input components
│   │       ├── Input.tsx
│   │       └── PasswordInput.tsx
│   │
│   ├── pages/
│   │   ├── auth/            # Sign in, sign up, forgot password, MFA verify
│   │   ├── dashboard/       # Main dashboard with cards and charts
│   │   ├── transactions/    # Transaction list + detail
│   │   ├── accounts/        # Account list + detail
│   │   ├── savings/         # Savings features
│   │   ├── loans/           # Loan products + applications + repayment
│   │   ├── support/         # Ticket list + detail
│   │   ├── settings/        # Profile, password, MFA, notifications
│   │   └── admin/           # Admin portal pages
│   │
│   ├── router/
│   │   └── AppRouter.tsx    # Route definitions, PrivateRoute, AdminRoute
│   │
│   ├── utils/               # Pure helper functions
│   │   ├── formatters.ts    # Currency, date, account number formatters
│   │   └── cn.ts            # Tailwind class merging utility
│   │
│   ├── styles/
│   │   └── globals.css      # Tailwind directives + custom component classes
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── docs/                    # Developer documentation
├── tailwind.config.js       # Design tokens (colors, fonts, shadows)
├── vite.config.ts
├── tsconfig.json
├── vercel.json              # Vercel deployment (SPA routing + headers)
└── package.json
```

---

## Documentation

| Document | Description |
|---|---|
| [docs/design-system.md](docs/design-system.md) | Colors, typography, spacing, component classes |
| [docs/pages.md](docs/pages.md) | All pages — purpose, route, and data flow |
| [docs/state-management.md](docs/state-management.md) | Zustand stores and TanStack Query patterns |
| [docs/api-integration.md](docs/api-integration.md) | Axios client, JWT refresh flow, error handling |
| [docs/routing.md](docs/routing.md) | Route structure, guards, and navigation |
| [docs/deployment.md](docs/deployment.md) | Vercel deployment and CI/CD setup |

---

## Available Scripts

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Type-check without emitting
npm run typecheck

# Lint with ESLint
npm run lint

# Run tests (Vitest)
npm run test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

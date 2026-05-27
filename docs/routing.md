# Routing

## Setup

React Router v6 with `BrowserRouter`. All routes are defined in `src/router/AppRouter.tsx`.

---

## Route Guards

### `PrivateRoute`

Wraps all customer-facing pages. Redirects unauthenticated users to `/auth/login`, preserving the intended destination:

```tsx
function PrivateRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore(s => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
```

After login, the auth page reads `location.state.from` and redirects back to the original destination.

### `AdminRoute`

Wraps all admin portal pages. Checks that the user is authenticated AND has a non-CUSTOMER role:

```tsx
function AdminRoute({ children, requiredRole }: Props) {
  const user = useAuthStore(s => s.user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  if (user.role === "CUSTOMER") {
    return <Navigate to="/dashboard" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
```

`requiredRole` is used for sensitive admin pages:
- `/admin/fees` requires `SUPER_ADMIN`
- `/admin/audit` requires `COMPLIANCE_AUDITOR`

---

## AppShell

`AppShell` is a component rendered inside the router but outside all page components. It runs global side effects:

```tsx
function AppShell({ children }: { children: ReactNode }) {
  useInactivityLogout(15 * 60 * 1000);
  useWebSocket(handleWSMessage);
  return <>{children}</>;
}
```

This ensures:
- Inactivity timer is always running while the user is logged in.
- WebSocket connection is maintained across page navigations.
- Balance updates and notifications work on any page without remounting.

---

## Navigation

### Sidebar navigation items

```ts
const navItems = [
  { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard },
  { label: "Transactions",  href: "/transactions",  icon: ArrowLeftRight },
  { label: "Accounts",      href: "/accounts",      icon: Wallet },
  { label: "Loans",         href: "/loans",         icon: Landmark },
  { label: "Statements",    href: "/statements",    icon: FileText },
  { label: "Support",       href: "/support",       icon: MessageSquare },
  { label: "Settings",      href: "/settings",      icon: Settings },
];
```

Active state is determined by `useLocation()` matching the href. Active items receive `bg-accent/10 text-accent` Tailwind classes.

---

## Redirects

| From | To | Condition |
|---|---|---|
| `/` | `/dashboard` | Always |
| `/auth/login` | `/dashboard` | If already authenticated |
| Any `/admin/*` | `/auth/login` | If unauthenticated |
| Any `/admin/*` | `/dashboard` | If role is `CUSTOMER` |
| `*` (404) | `/dashboard` | Catch-all for authenticated users |
| `*` (404) | `/auth/login` | Catch-all for unauthenticated users |

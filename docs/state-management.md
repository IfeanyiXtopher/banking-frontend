# State Management

Two complementary layers handle state in this app:

| Layer | Tool | What it owns |
|---|---|---|
| Global client state | **Zustand** | Auth session, notification count |
| Server/async state | **TanStack Query** | All API data (accounts, transactions, etc.) |

---

## Zustand Stores

### `authStore` — `src/store/authStore.ts`

Persisted to `localStorage` via the `persist` middleware.

```ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}
```

**Usage:**
```tsx
import { useAuthStore } from "@/store/authStore";

const { user, accessToken, clearAuth } = useAuthStore();
```

**Rules:**
- `accessToken` is used by the Axios interceptor on every request.
- `clearAuth()` is called on logout and on inactivity timeout.
- Never store sensitive data beyond what's needed for requests.

---

### `notifStore` — `src/store/notifStore.ts`

Not persisted — rebuilt from WebSocket events.

```ts
interface NotifState {
  unreadCount: number;
  increment: () => void;
  reset: () => void;
  setCount: (n: number) => void;
}
```

The WebSocket consumer increments `unreadCount` on every incoming notification. The notification bell in `Header` reads this value. On opening the notification panel, `reset()` is called after marking all read.

---

## TanStack Query Patterns

### Query Keys Convention

```ts
// Flat array format, ordered from broad → specific
["accounts"]                        // all accounts
["accounts", accountId]             // one account
["transactions", { page, filters }] // paginated transactions
["loans", "products"]               // loan product list
```

### Typical Page Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { accountsApi } from "@/api/accounts";

function AccountListPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
    staleTime: 30_000,      // data stays fresh for 30s
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <Spinner />;
  if (isError) return <ErrorMessage />;

  return data.results.map(acc => <AccountCard key={acc.id} account={acc} />);
}
```

### Mutation + Cache Invalidation

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "@/api/transactions";

function TransferForm() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: transactionsApi.transfer,
    onSuccess: () => {
      // Invalidate accounts so balances refresh
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transfer completed.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail ?? "Transfer failed.");
    },
  });
}
```

### Pagination

```tsx
const [page, setPage] = useState(1);

const { data } = useQuery({
  queryKey: ["transactions", { page }],
  queryFn: () => transactionsApi.list({ page }),
  placeholderData: keepPreviousData,  // no flash between pages
});
```

---

## Global Hooks

### `useAuth`

Wraps auth-related operations and Zustand store:

```ts
const { login, verifyMFA, logout, refreshProfile } = useAuth();
```

- `login(email, password)` — calls API, handles MFA flag, sets store.
- `logout()` — calls `authApi.logout(refresh)`, clears store, navigates to `/auth/login`.
- `refreshProfile()` — re-fetches `/api/auth/profile/` and updates `user` in store.

---

### `useWebSocket`

Manages a persistent WebSocket connection with exponential backoff reconnection:

```ts
const { isConnected } = useWebSocket(onMessage);
```

`onMessage` receives:
```ts
type WSMessage =
  | { type: "notification"; notification: Notification }
  | { type: "balance_update"; account_id: string; balance: string };
```

Connection is established on mount if `accessToken` is present, and closed on logout/unmount.

---

### `useInactivityLogout`

Resets a `setTimeout` on any user interaction event. On expiry, calls `logout()`.

```ts
// AppShell (always-mounted wrapper inside AppLayout)
useInactivityLogout(15 * 60 * 1000);  // 15 minutes
```

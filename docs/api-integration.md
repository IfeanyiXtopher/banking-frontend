# API Integration

## Axios Client — `src/api/client.ts`

A single Axios instance is used for all API calls. It handles:
1. **Base URL** — from `VITE_API_BASE_URL` environment variable.
2. **Authorization header** — reads `accessToken` from Zustand store.
3. **JWT refresh** — automatically refreshes expired tokens and retries failed requests.
4. **Error normalization** — all errors include a human-readable `message` property.

### Request Interceptor

```ts
axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor (Token Refresh)

```ts
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        useAuthStore.getState().setAccessToken(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return axiosClient(original);   // retry original request
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

**What this means:**
- Access tokens expire after 15 minutes.
- When the first 401 response is detected, the interceptor silently fetches a new access token.
- The original request is retried with the new token.
- If the refresh also fails (refresh token expired), the user is logged out and redirected.

---

## API Service Modules

Each file in `src/api/` exports typed functions that wrap Axios calls.

### `src/api/auth.ts`

```ts
export const authApi = {
  register:              (data) => client.post("/api/auth/register/", data),
  login:                 (data) => client.post("/api/auth/login/", data),
  verifyMFA:             (data) => client.post("/api/auth/login/mfa/", data),
  logout:                (data) => client.post("/api/auth/logout/", data),
  refreshToken:          (data) => client.post("/api/auth/token/refresh/", data),
  getProfile:            ()     => client.get("/api/auth/profile/"),
  updateProfile:         (data) => client.patch("/api/auth/profile/", data),
  changePassword:        (data) => client.post("/api/auth/change-password/", data),
  requestPasswordReset:  (data) => client.post("/api/auth/password-reset/", data),
  confirmPasswordReset:  (data) => client.post("/api/auth/password-reset/confirm/", data),
  uploadKYC:             (form) => client.post("/api/auth/kyc/upload/", form, { headers: { "Content-Type": "multipart/form-data" } }),
  toggleMFA:             ()     => client.post("/api/auth/mfa/toggle/"),
};
```

### `src/api/accounts.ts`

```ts
export const accountsApi = {
  list:       (params?) => client.get("/api/accounts/", { params }),
  create:     (data)    => client.post("/api/accounts/", data),
  get:        (id)      => client.get(`/api/accounts/${id}/`),
  currencies: ()        => client.get("/api/accounts/currencies/"),
};
```

### `src/api/transactions.ts`

```ts
export const transactionsApi = {
  list:     (params?) => client.get("/api/transactions/", { params }),
  get:      (id)      => client.get(`/api/transactions/${id}/`),
  deposit:  (data)    => client.post("/api/transactions/deposit/", data),
  withdraw: (data)    => client.post("/api/transactions/withdraw/", data),
  transfer: (data)    => client.post("/api/transactions/transfer/", data),
  fees:     ()        => client.get("/api/transactions/fees/"),
  rates:    ()        => client.get("/api/transactions/exchange-rates/"),
};
```

### `src/api/statements.ts`

```ts
export const statementsApi = {
  list:     (params?) => client.get("/api/statements/", { params }),
  request:  (data)    => client.post("/api/statements/request/", data),
  download: (id)      => client.get(`/api/statements/${id}/download/`, {
    responseType: "blob",  // important for binary PDF response
  }),
};
```

Download usage:
```ts
const { data } = await statementsApi.download(id);
const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
const a = document.createElement("a");
a.href = url;
a.download = `statement-${id}.pdf`;
a.click();
```

---

## Idempotency Keys

For all mutation requests that create transactions, the client generates a UUID v4 per form submission:

```ts
import { v4 as uuidv4 } from "uuid";

function handleSubmit(values) {
  transactionsApi.transfer({
    ...values,
    idempotency_key: uuidv4(),  // new key per attempt
  });
}
```

If the user double-clicks or the network retries, the backend will return the same transaction without duplicating the debit.

---

## Error Handling

All API errors surface the same shape:

```ts
// From Axios error: error.response.data
{ "detail": "Insufficient available balance." }
{ "amount": ["Ensure this value is greater than 0."] }
```

Pattern used across forms:

```ts
const { mutate } = useMutation({
  mutationFn: transactionsApi.transfer,
  onError: (error: AxiosError<ApiError>) => {
    const data = error.response?.data;
    if (data?.detail) {
      toast.error(data.detail);
    } else if (data) {
      // Field-level errors — pass to react-hook-form
      Object.entries(data).forEach(([field, messages]) => {
        form.setError(field as any, { message: (messages as string[])[0] });
      });
    }
  },
});
```

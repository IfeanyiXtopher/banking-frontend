# Deployment (Vercel)

## Overview

The React SPA is deployed to Vercel as a static site. Because it uses client-side routing, Vercel is configured to rewrite all requests to `index.html`.

---

## `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Vercel Project Setup

1. **Import repo:** Go to [vercel.com/new](https://vercel.com/new), import your `banking-frontend` repository.
2. **Framework preset:** Vercel auto-detects Vite — no changes needed.
3. **Build settings** (auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables** (Settings → Environment Variables):

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://api.yourdomain.com` |
| `VITE_WS_URL` | `wss://api.yourdomain.com` |

Set these for **Production**, **Preview**, and **Development** environments separately.

---

## Custom Domain

1. In Vercel project → Settings → Domains → Add Domain → enter `app.yourdomain.com`.
2. Add the DNS record Vercel provides (usually a CNAME) in your DNS provider.
3. Vercel automatically provisions and renews TLS.

---

## GitHub Actions CI/CD

`.github/workflows/ci.yml` runs on every push and PR:

1. **Install** — `npm ci`
2. **Lint** — `npm run lint`
3. **Type-check** — `npm run typecheck`
4. **Test** — `npm run test`
5. **Build** — `npm run build` (verifies the bundle compiles)
6. **Deploy to Vercel** — runs on push to `main` using the Vercel CLI

**Required GitHub Secrets:**

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Personal access token from [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Found in Vercel project settings |
| `VERCEL_PROJECT_ID` | Found in Vercel project settings |

**To find `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`:**
```bash
npm i -g vercel
vercel link   # links repo to Vercel project, writes .vercel/project.json
cat .vercel/project.json
```

**Deploy step in CI:**
```yaml
- name: Deploy to Vercel
  run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  env:
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Preview Deployments

Every pull request automatically gets a preview deployment at a unique URL (e.g. `banking-frontend-git-feature-xyz.vercel.app`). This is Vercel's default behaviour — no extra configuration needed.

---

## Production Checklist

Before going live:

- [ ] `VITE_API_BASE_URL` points to the production VPS API URL
- [ ] `VITE_WS_URL` uses `wss://` (not `ws://`)
- [ ] Backend `CORS_ALLOWED_ORIGINS` includes your Vercel domain
- [ ] Custom domain is configured and TLS is active
- [ ] `vercel.json` security headers are in place
- [ ] Sentry DSN is set in Vercel environment variables (if using frontend Sentry)

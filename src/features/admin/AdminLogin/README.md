# AdminLogin

Admin authentication screen using Google OAuth via serverless functions.

## Route
`/login`

## Key files
- `index.tsx` — login screen, button navigates to `/api/auth/google`
- `src/routes/login.tsx` — public route
- `src/routes/admin.tsx` — layout route with `beforeLoad` guard: calls `GET /api/auth/me`, redirects to `/login` on 401

## Auth flow
```
/login → click → /api/auth/google → Google consent → /api/auth/callback
→ httpOnly session cookie → redirect to /admin/events
```

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/auth/google` | Generates OAuth URL, redirects to Google |
| `GET` | `/api/auth/callback` | Exchanges code, sets session cookie, redirects |
| `GET` | `/api/auth/me` | Verifies session cookie, returns user |
| `POST` | `/api/auth/logout` | Clears session cookie |

Session is a HMAC-SHA256 signed token stored in an `httpOnly` cookie (30-day TTL).
No credentials are ever exposed to the browser bundle.

## Status
- [x] Google OAuth sign-in button
- [x] Auth guard on `/admin/*` via `GET /api/auth/me`
- [x] httpOnly session cookie (HMAC-signed, 30 days)
- [x] CSRF state validation on OAuth callback
- [x] Logout endpoint
- [x] i18n: en, es, pt-BR

## Notes
Required env vars (server-side only — never in `VITE_*`):
- `GOOGLE_CLIENT_ID` — Google Cloud Console → APIs & Services → Credentials
- `GOOGLE_CLIENT_SECRET` — same as above
- `SESSION_SECRET` — any long random string (`openssl rand -base64 32`)
- `APP_URL` — base URL for OAuth callback (`http://localhost:3000` dev, production URL in prod)

In Google Cloud Console, add `{APP_URL}/api/auth/callback` as an authorized redirect URI.

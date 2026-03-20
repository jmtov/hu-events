# AdminLogin

Admin authentication screen using Supabase Google OAuth.

## Route
`/login`

## Key files
- `index.tsx` — login screen component
- `src/lib/supabase.ts` — Supabase client (shared)
- `src/routes/login.tsx` — public route
- `src/routes/admin.tsx` — layout route with `beforeLoad` auth guard for all `/admin/*` routes

## Endpoints
No direct API calls. Auth is handled entirely by the Supabase JS SDK.

OAuth flow: `supabase.auth.signInWithOAuth({ provider: 'google' })` → Google → redirect to `/admin/events` → Supabase processes hash → session stored in localStorage.

## Status
- [x] Google OAuth sign-in button
- [x] Auth guard on `/admin/*` (redirects to `/login` if no session)
- [x] Supabase session token forwarded in API requests via `src/lib/api.ts`
- [x] i18n: en, es, pt-BR

## Notes
- Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- In Supabase dashboard, add `http://localhost:5173` (dev) and the production URL as allowed redirect URLs under Auth → URL Configuration
- Google provider must be enabled in Supabase Auth → Providers

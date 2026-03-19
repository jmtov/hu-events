# Event OS — Claude Code context

## What this project is

An event management platform for corporate events (HR retreats, workshops, BDR calls, hackathons, etc.).
Two user roles: **Admin** (creates and manages events) and **Attendee** (receives notifications, completes checklist, uploads documents).

## Reference documents — read before writing code

| Document | What it contains |
|---|---|
| `docs/features_list.md` | Full feature list, organized by module and user role |
| `docs/technical_docs_plan.md` | One entry per feature: route, endpoints, hooks, notes. Also contains global stack conventions |
| `docs/api_layer.md` | API layer architecture, serverless function structure, environment variables, and rules |

Always cross-reference these before implementing any feature.

## Stack

| Layer | Tool |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Routing | TanStack Router (file-based, under `src/routes/`) |
| Data fetching | TanStack Query (hooks under `src/hooks/`) |
| Forms | React Hook Form + Zod (schema co-located in `FeatureName/constants.ts`) |
| i18n | i18next + react-i18next — JSON files in `public/locales/<lang>/` |
| API client | axios via `src/lib/api.ts` → points to `/api` |
| API layer | Vercel Serverless Functions under `api/` |
| Database | Supabase (Postgres) — accessed only from serverless functions |
| AI | Claude API — called only from serverless functions, never from the frontend |
| Automations | n8n (cloud) — serverless functions proxy to n8n via webhooks, never called directly from the frontend |
| Deploy | Vercel |

## Conventions — follow these for every file you touch

### Routing
- All routes under `src/routes/` using TanStack Router file-based conventions
- Navigation via `<Link>` or `router.navigate()` — never `window.location`
- Protected routes wrap children with an auth guard

### Data fetching
- All server state via TanStack Query hooks in `src/hooks/`
- Naming: `useGetX()` for queries, `useCreateX()` / `useUpdateX()` / `useDeleteX()` for mutations
- Always call `queryClient.invalidateQueries()` after a successful mutation
- No direct `fetch()` calls in components — always go through a hook → service → `src/lib/api.ts`

### API layer
- The frontend only calls `/api/...` routes — never external URLs directly
- Secrets live only in serverless functions via `process.env` — never in the frontend
- Every serverless function must: validate the HTTP method (return 405 if wrong), handle errors with meaningful status codes, and parse/validate AI responses before returning them

### n8n workflows
The frontend never calls n8n directly. Flow: `Frontend → PATCH /api/triggers/:triggerId → Vercel Serverless → n8n webhook → Slack / Email / WhatsApp`.

Every request from the serverless function to n8n must include `x-webhook-secret: process.env.N8N_WEBHOOK_SECRET` in the header.

Four workflows are defined — see `docs/api_layer.md` for exact webhook payloads:

| Workflow | Trigger | Recipient | Channel |
|---|---|---|---|
| RSVP milestone | RSVP crosses 50% of expected attendees | HR admin | Slack |
| Checklist incomplete | Required item not completed X days before event | Attendee | Email or WhatsApp |
| Deadline approaching | RSVP deadline 24h away, attendee unconfirmed | Unconfirmed attendees | Email |
| Event ended | Event date has passed | All attendees | Email |

### Database
- The frontend never connects to Supabase directly — all DB access goes through `api/`
- Serverless functions use `api/_lib/supabase.ts` to get the Supabase client
- When `USE_MOCK_DATA=true`, serverless functions return data from `api/_fixtures/` instead of querying Supabase
- `api/_fixtures/` is the **single source of truth** for test data — never edit `supabase/seed.sql` by hand
- To regenerate `seed.sql` after changing a fixture: `npm run db:seed`
- Schema migrations live in `supabase/migrations/`, one file per domain, named with a timestamp prefix
- See `docs/api_layer.md` for the full database section including environment variables and local setup

### Mock data
- **All mock data lives exclusively in `api/_fixtures/`** — never define hardcoded demo data inside components, constants files, or feature folders
- Fixtures mirror the exact shape of the Supabase tables defined in `supabase/migrations/`
- Features that need data during development must call the real API endpoint (`USE_MOCK_DATA=true` makes the serverless function return fixture data automatically)
- If a fixture doesn't yet exist for a new entity, add it to `api/_fixtures/` and run `npm run db:seed`
- Inline `DEMO_*` constants or local mock arrays in component files are a convention violation

### Forms
- React Hook Form for all form state — no `useState` for form fields
- Zod schemas co-located with their feature in `FeatureName/constants.ts` — there is no global `src/schemas/` folder
- Connect via `@hookform/resolvers/zod`
- Never inline validation logic in components
- Form components must be named `<Domain>Form` — e.g. `CreateEventForm`, `AttendeeRegistrationForm`
- Use `<FormProvider>` at the form root so nested field components can access context via `useFormContext()`
- Shared field components live in `src/components/<Input|Select|...>/form.tsx` — they use `Controller` + `useFormContext()` internally

### TypeScript
- Prefer **`type`** over `interface`
- No `any` — use `unknown` and narrow explicitly
- No non-null assertion (`!`) — use optional chaining or conditionals
- No native `enum` — use `const` objects with `as const` and a derived type
- Entity types in `src/types/`, one file per domain

### React components
- Functional components only, one per file, PascalCase filename
- Feature components in `src/features/<domain>/`, shared UI in `src/components/`
- Props typed with a named `interface`, never `React.FC`
- `useState` only for local UI state (open/closed, tabs) — not for server data or form fields
- Use **shadcn/ui** components as the base for all UI — never build from scratch what shadcn covers
- Use **Tailwind CSS** for all styling — never use inline `style` props

## Existing code

There is code under `src/` written before these conventions were defined. It may not follow the rules above. **Do not touch it unless explicitly asked.** When the time comes, use `/migrate-to-standards` to align it.

## Feature READMEs

Every time you create a new feature or screen, also create a `README.md` in that feature's folder. It must cover:

- **What it does** — one sentence describing the feature
- **Route** — the URL path (from `docs/technical_docs_plan.md`)
- **Key files** — main component, hooks used, service file, schema file
- **Endpoints** — the API calls this feature makes
- **Notes** — anything non-obvious about the implementation

This README is for future agents and collaborators — keep it short and factual, no fluff.

---

## How to behave

- Always read the relevant feature entry in `docs/technical_docs_plan.md` before writing code for that feature
- If something is unclear or two documents contradict each other, ask before assuming
- AI suggestions in the UI are non-blocking — the form must be usable before the AI responds
- All AI output shown to users is editable — AI suggests, admin decides
- Modules are independent — no module should assume another is enabled
- **Never use emojis** in UI code, labels, messages, or comments unless the user explicitly requests it
- **Never commit or open a PR unless the user explicitly asks** — finish the work, show what changed, and wait

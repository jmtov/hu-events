# Event OS

Event management platform for corporate events — HR retreats, workshops, BDR calls, hackathons, and more.

Admins create and configure events. Attendees receive notifications, complete their checklist, and upload documents.

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Routing | TanStack Router |
| Data fetching | TanStack Query |
| Forms | TanStack Form + Zod |
| API layer | Vercel Serverless Functions (`api/`) |
| AI | Claude API (Anthropic) |
| Automations | n8n (cloud) |
| Notifications | Slack, Email, WhatsApp |
| Deploy | Vercel |

---

## Project structure

```
api/               # Vercel Serverless Functions — all external API calls go here
src/
  components/      # Shared UI components
  features/        # Feature-level components, organized by domain
  hooks/           # TanStack Query hooks (useGetX, useCreateX, etc.)
  lib/             # Shared utilities (api.ts client, etc.)
  routes/          # TanStack Router file-based routes
  schemas/         # Zod validation schemas
  services/        # Service files that call src/lib/api.ts
  types/           # TypeScript entity types
docs/
  features_list.md        # All features, organized by module and user role
  technical_docs_plan.md  # One entry per feature: route, endpoints, hooks, notes
  api_layer.md            # API layer architecture, env vars, n8n webhook payloads
```

---

## Getting started

**1. Install dependencies**
```bash
npm install
```

**2. Set up environment variables**

Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

**3. Run the dev server**
```bash
npm run dev
```

---

## Environment variables

Secrets live in `.env.local` for development and in the Vercel dashboard for production. Never commit `.env.local`.

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key |
| `N8N_WEBHOOK_URL` | n8n webhook base URL |
| `N8N_WEBHOOK_SECRET` | Shared secret for n8n webhook authentication |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SESSION_SECRET` | Secret for signing session tokens |

---

## Docs

- [`docs/features_list.md`](./docs/features_list.md) — full feature list
- [`docs/technical_docs_plan.md`](./docs/technical_docs_plan.md) — technical spec per feature
- [`docs/api_layer.md`](./docs/api_layer.md) — API layer, serverless functions, n8n payloads

---

## Working with Claude Code

This project has a [`CLAUDE.md`](./CLAUDE.md) at the root with the full project context, stack conventions, and coding rules. Claude Code reads it automatically at the start of every session.

Before writing any code, Claude will cross-reference the feature docs above.

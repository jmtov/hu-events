# Event OS — API Layer

## Overview

All API calls go through **Vercel Serverless Functions**. The frontend never calls external APIs directly — no API keys, tokens, or secrets are ever exposed to the client.

```
Frontend (React)
    ↓ fetch
Vercel Serverless Function (/api/...)
    ↓ server-side call with secret keys
External service (Claude API, n8n, etc.)
```

---

## File structure

Serverless functions live under `api/` at the project root — Vercel picks them up automatically.

```
api/
  events/
    index.ts          # GET /api/events, POST /api/events
    [eventId].ts      # GET /api/events/:eventId, PATCH /api/events/:eventId
    [eventId]/
      participants.ts
      checklist.ts
      budget.ts
      triggers.ts
      contacts.ts
      dashboard.ts
      trigger-log.ts
  participants/
    [participantId].ts
    [participantId]/
      checklist.ts
      receipts.ts
  checklist-items/
    [itemId]/
      complete.ts
  triggers/
    [triggerId].ts
  ai/
    detect-event-type.ts
    generate-checklist.ts
    suggest-preference-fields.ts
    estimate-budget.ts
  auth/
    google.ts
```

---

## Frontend API client

The frontend calls only `/api/...` routes — never external URLs directly.

```ts
// src/lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

All service files in `src/services/` use this client:

```ts
// src/services/events.ts
import { api } from '@/lib/api'
import type { Event, CreateEventPayload } from '@/types/event'

export const eventService = {
  getById: (eventId: string) =>
    api.get<Event>(`/events/${eventId}`).then((r) => r.data),

  create: (payload: CreateEventPayload) =>
    api.post<Event>('/events', payload).then((r) => r.data),
}
```

---

## Serverless function structure

Each function handles one route and one or more HTTP methods. Secrets are read from environment variables — never hardcoded.

```ts
// api/ai/detect-event-type.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, description } = req.body

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{ role: 'user', content: buildPrompt(title, description) }],
  })

  const text = message.content.find((b) => b.type === 'text')?.text ?? ''
  return res.status(200).json(JSON.parse(text))
}
```

---

## Environment variables

Secrets live in `.env.local` for development and in the Vercel dashboard for production. Never commit secrets to the repo.

| Variable | Used by | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | `api/ai/*` | Claude API key |
| `N8N_WEBHOOK_SECRET` | `api/triggers/*` | Shared secret to validate n8n webhook calls |
| `GOOGLE_CLIENT_ID` | `api/auth/google.ts` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `api/auth/google.ts` | Google OAuth client secret |
| `SESSION_SECRET` | `api/auth/google.ts` | Secret for signing session tokens |

---

## AI functions

All Claude API calls live in `api/ai/`. Each function receives a payload from the frontend, builds the prompt server-side, calls the Claude API, and returns clean JSON.

| Route | Method | Input | Output |
|---|---|---|---|
| `/api/ai/detect-event-type` | POST | `{ title, description }` | `{ eventType }` |
| `/api/ai/generate-checklist` | POST | `{ description }` | `{ items: ChecklistItem[] }` |
| `/api/ai/suggest-preference-fields` | POST | `{ description }` | `{ fields: PreferenceField[] }` |
| `/api/ai/estimate-budget` | POST | `{ attendees, eventDates }` | `{ breakdown: BudgetBreakdown }` |

All prompts must instruct the model to return **only valid JSON — no markdown fences, no preamble**.

---

## n8n workflows

All notification logic is handled by n8n. The frontend never calls n8n webhooks directly — it calls a serverless function at `api/triggers/[triggerId].ts`, which validates the request and forwards it to n8n with the shared secret.

```
Frontend
    ↓ PATCH /api/triggers/:triggerId
Vercel Serverless Function
    ↓ POST to n8n webhook URL + N8N_WEBHOOK_SECRET header
n8n workflow
    ↓ sends message via Slack / Email / WhatsApp
```

### Workflows

| Workflow | n8n trigger | Sends to | Channel |
|---|---|---|---|
| RSVP milestone | RSVP count crosses 50% of expected attendees | HR admin | Slack |
| Checklist incomplete | Attendee has not completed a required item by X days before event | Attendee | Email or WhatsApp |
| Deadline approaching | RSVP deadline is 24h away and attendee has not confirmed | Unconfirmed attendees | Email |
| Event ended | Event date has passed | All attendees | Email |

### Webhook payloads

**Workflow 1 — RSVP milestone**
```json
{
  "eventId": "evt_123",
  "eventName": "Q2 HR Retreat",
  "currentRsvpCount": 4,
  "expectedAttendees": 8,
  "thresholdPercent": 50
}
```

**Workflow 2 — Checklist incomplete**
```json
{
  "eventId": "evt_123",
  "eventName": "Q2 HR Retreat",
  "attendeeEmail": "gabriel@humand.co",
  "attendeeName": "Gabriel Gouveia",
  "incompleteItems": ["Passport upload", "RSVP confirmation"],
  "daysBeforeEvent": 3,
  "channel": "whatsapp"
}
```

**Workflow 3 — Deadline approaching**
```json
{
  "eventId": "evt_123",
  "eventName": "Q2 HR Retreat",
  "attendeeEmail": "gabriel@humand.co",
  "attendeeName": "Gabriel Gouveia",
  "rsvpDeadline": "2026-04-01T23:59:00Z",
  "channel": "email"
}
```

**Workflow 4 — Event ended**
```json
{
  "eventId": "evt_123",
  "eventName": "Q2 HR Retreat",
  "attendees": [
    { "email": "gabriel@humand.co", "name": "Gabriel Gouveia" }
  ],
  "surveyUrl": "https://survey.humand.co/evt_123",
  "channel": "email"
}
```

### Authentication

Every request from the serverless function to n8n includes a shared secret in the header:

```ts
await fetch(process.env.N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-secret': process.env.N8N_WEBHOOK_SECRET,
  },
  body: JSON.stringify(payload),
})
```

n8n must validate this header at the start of every workflow and reject requests that don't include it.

---

## Database — Supabase

All database access goes through the Vercel Serverless Functions. The frontend never connects to Supabase directly.

### Connection

```ts
// api/_lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
)
```

`SUPABASE_SERVICE_KEY` is the service role key (full access). Never expose it to the frontend.

### Mock fallback

When `USE_MOCK_DATA=true`, serverless functions return data from `api/_fixtures/` instead of querying Supabase. This lets the team develop without needing Supabase credentials.

```ts
// Pattern used in every serverless function
import { events } from '../_fixtures'

export default async function handler(req, res) {
  if (process.env.USE_MOCK_DATA === 'true') {
    return res.json(events)
  }
  const { data } = await supabase.from('events').select('*')
  return res.json(data)
}
```

Set in `.env.local`:
```
USE_MOCK_DATA=true          # local dev without Supabase
USE_MOCK_DATA=false         # use real Supabase (requires SUPABASE_URL + SUPABASE_SERVICE_KEY)
```

### Fixtures — single source of truth for test data

`api/_fixtures/` contains typed TypeScript data. These files are the **only** place test data is defined.

- Serverless functions import them directly when `USE_MOCK_DATA=true`
- `supabase/seed.sql` is generated from them — never edit seed.sql by hand
- Fixture shapes must match the Supabase table schemas defined in `supabase/migrations/`

To regenerate seed.sql after changing a fixture:
```bash
npm run db:seed
```

**Fixtures are the only source of mock data — no exceptions.**

Do not define `DEMO_*` constants, local mock arrays, or hardcoded test objects inside components, feature folders, or constants files. If a feature needs data during development, the serverless function returns fixture data automatically when `USE_MOCK_DATA=true`. The frontend code does not need to know whether data is real or mocked.

### Schema migrations

SQL migrations live in `supabase/migrations/`, one file per domain, named with a timestamp prefix:

```
supabase/migrations/
  20260318000001_create_events.sql
  20260318000002_create_participants.sql
  20260318000003_create_checklist.sql
  20260318000004_create_budget.sql
  20260318000005_create_notifications.sql
  20260318000006_create_contacts_and_receipts.sql
```

Local development with Supabase CLI (requires Docker):
```bash
supabase start          # starts local Postgres + Studio
supabase db reset       # drops DB, applies all migrations + seed.sql
supabase stop
```

### Environment variables for Supabase

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Project URL from the Supabase dashboard |
| `SUPABASE_SERVICE_KEY` | Service role key — full DB access, never expose to frontend |

---

## Rules for Claude Code

- **Never call external APIs from the frontend** — always proxy through `api/`
- **Never hardcode secrets** — always use `process.env.VARIABLE_NAME`
- **Never commit `.env.local`** — it must be in `.gitignore`
- Every serverless function must validate the HTTP method and return `405` if it doesn't match
- Every serverless function must handle errors and return a meaningful status code — never let an unhandled exception return a `500` with no body
- AI functions must always parse and validate the Claude response before returning it to the frontend — if the response is not valid JSON, return a `502` with a clear error message

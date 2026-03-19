# Event OS — API Layer

## Overview

All API calls go through **Vercel Serverless Functions**. The frontend never calls external APIs directly — no API keys, tokens, or secrets are ever exposed to the client.

```
Frontend (React)
    ↓ fetch
Vercel Serverless Function (/api/...)
    ↓ server-side call with secret keys
External service (Claude API, n8n, Supabase, etc.)
```

---

## File structure

A single catch-all function at `api/[...path].ts` handles all API routes. Individual route handlers live under `api/_routes/` (Vercel ignores files and directories with a leading `_`, so they don't count against the function limit).

```
api/
  [...path].ts              # Catch-all entry point — routes every /api/* request
  _routes/
    admin/
      events.ts             # GET /api/admin/events
    events/
      index.ts              # GET /api/events, POST /api/events
      [eventId].ts          # GET /api/events/:eventId, PUT /api/events/:eventId, DELETE /api/events/:eventId
      [eventId]/
        attendance.ts       # PATCH /api/events/:eventId/attendance (attendee actions)
    upload/
      sign.ts               # POST /api/upload/sign
    triggers/
      [triggerId].ts        # POST /api/triggers/:triggerId
    ai/
      detect-event-type.ts  # POST /api/ai/detect-event-type
      generate-checklist.ts # POST /api/ai/generate-checklist
      suggest-preference-fields.ts # POST /api/ai/suggest-preference-fields
  _lib/
    supabase.ts             # Supabase client
    participant-store.ts    # Mock data helpers
  _fixtures/
    events.ts               # Fixture data for events
    participants.ts         # Fixture data for participants
    checklist.ts            # Fixture data for checklist items
```

### How the catch-all router works

Vercel populates `req.query.path` with the matched path segments as a string array.

```
GET /api/events/abc/attendance → req.query.path = ['events', 'abc', 'attendance']
```

`api/[...path].ts` matches segments against a pattern table and calls the corresponding handler. Dynamic segments (e.g. `:eventId`) are extracted and merged into `req.query` so handlers can read them normally.

---

## Endpoints

No authentication is required for any endpoint in this MVP.

### Admin

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/events` | List all events (admin view, includes RSVP counts) |

### Events

| Method | Path | Description |
|---|---|---|
| GET | `/api/events` | List events (attendee view) |
| POST | `/api/events` | Create a new event — full payload (see below) |
| GET | `/api/events/:eventId` | Get event details |
| PUT | `/api/events/:eventId` | Update event — full payload |
| DELETE | `/api/events/:eventId` | Delete event and all associated data |

### Attendance (attendee actions)

| Method | Path | Description |
|---|---|---|
| PATCH | `/api/events/:eventId/attendance` | Action-based attendee endpoint — covers RSVP, checklist, file upload, profile. When `action: 'rsvp'` crosses the 50% threshold, fires n8n Workflow 1 + Workflow 2 server-side. |

### Uploads

| Method | Path | Description |
|---|---|---|
| POST | `/api/upload/sign` | Get a signed URL for direct upload to Supabase Storage |

### Triggers (n8n)

| Method | Path | Description |
|---|---|---|
| POST | `/api/triggers/:triggerId` | Proxy a trigger to the n8n webhook |

### AI

| Method | Path | Description |
|---|---|---|
| POST | `/api/ai/detect-event-type` | Detect event type from title + description |
| POST | `/api/ai/generate-checklist` | Generate a checklist from event description |
| POST | `/api/ai/suggest-preference-fields` | Suggest preference fields from event description |

---

## Full-payload save model

The frontend sends the **entire event state** in a single request when saving, both on create and on update. The serverless function is responsible for splitting the payload and writing to the correct tables.

### POST /api/events — create

```ts
type CreateEventPayload = {
  // Event basics
  title: string
  description: string
  event_type: string
  date_start: string             // ISO 8601
  date_end: string               // ISO 8601
  location: string
  expected_attendees: number
  event_day_info?: string        // shown to attendees only on event day

  // Module toggles
  modules: {
    participantList: boolean
    checklist: boolean
    preferenceFields: boolean
    budget: boolean
    notifications: boolean
  }

  // Participants (only when modules.participantList is true)
  participants?: Array<{ email: string }>

  // Checklist items (only when modules.checklist is true)
  checklist?: Array<{
    title: string
    type: 'checkbox' | 'document_upload' | 'info_input'
    required: boolean
    alertIfIncomplete: boolean
  }>

  // Preference fields (only when modules.preferenceFields is true)
  preferenceFields?: Array<{
    label: string
    type: 'text' | 'select' | 'boolean'
    required: boolean
    options?: string[]
  }>
}
```

The server creates the event row, then inserts participants, checklist items, and preference fields in one transaction. Returns the full event object.

### PUT /api/events/:eventId — update

Same payload shape as create. The server applies a full replace: existing child records (participants, checklist, preference fields) are diffed against the incoming payload — new ones inserted, removed ones deleted, existing ones updated.

---

## Attendee attendance endpoint

`PATCH /api/events/:eventId/attendance` is a single action-based endpoint that covers all attendee interactions.

```ts
type AttendanceAction =
  | { action: 'rsvp'; status: 'confirmed' | 'declined' }
  | { action: 'checklist_item'; itemId: string; value: boolean | string }
  | { action: 'profile'; full_name: string; location_city: string; location_region: string; location_country: string }
  | { action: 'upload'; itemId: string; signedUrl: string; filePath: string }
```

The `participantId` is resolved server-side from the event and the request context (email header or query param — no session for MVP).

---

## File upload flow

File uploads bypass the serverless function to avoid size limits and latency. The frontend:

1. Calls `POST /api/upload/sign` with `{ bucket, path, contentType }` to get a signed URL from Supabase Storage.
2. Uploads the file directly to Supabase Storage using the signed URL (plain `PUT` to the URL — no auth header needed).
3. Sends the resulting `filePath` to the attendance endpoint (`action: 'upload'`).

```ts
// Step 1 — get signed URL
const { signedUrl, filePath } = await api.post('/upload/sign', {
  bucket: 'receipts',
  path: `events/${eventId}/${participantId}/${filename}`,
  contentType: 'application/pdf',
})

// Step 2 — upload directly
await fetch(signedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/pdf' },
  body: file,
})

// Step 3 — record the upload
await api.patch(`/events/${eventId}/attendance`, {
  action: 'upload',
  itemId,
  signedUrl,
  filePath,
})
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
```

All service files in `src/services/` use this client:

```ts
// src/services/events.ts
import { api } from '@/lib/api'
import type { Event, CreateEventPayload } from '@/types/event'

export const eventService = {
  getAll: () =>
    api.get<Event[]>('/events').then((r) => r.data),

  getById: (eventId: string) =>
    api.get<Event>(`/events/${eventId}`).then((r) => r.data),

  create: (payload: CreateEventPayload) =>
    api.post<Event>('/events', payload).then((r) => r.data),

  update: (eventId: string, payload: CreateEventPayload) =>
    api.put<Event>(`/events/${eventId}`, payload).then((r) => r.data),

  delete: (eventId: string) =>
    api.delete(`/events/${eventId}`).then((r) => r.data),
}
```

---

## Serverless function structure

Each handler handles one route and one or more HTTP methods. Secrets are read from environment variables — never hardcoded.

```ts
// api/_routes/ai/detect-event-type.ts
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
| `ANTHROPIC_API_KEY` | `api/_routes/ai/*` | Claude API key |
| `N8N_WEBHOOK_SECRET` | `api/_routes/triggers/*` | Shared secret included in every n8n webhook call |
| `SUPABASE_URL` | `api/_lib/supabase.ts` | Project URL from the Supabase dashboard |
| `SUPABASE_SERVICE_KEY` | `api/_lib/supabase.ts` | Service role key — full DB access, never expose to frontend |
| `USE_MOCK_DATA` | All route handlers | `true` → return fixture data, `false` → query Supabase |

---

## AI functions

All Claude API calls live in `api/_routes/ai/`. Each function receives a payload from the frontend, builds the prompt server-side, calls the Claude API, and returns clean JSON.

| Route | Method | Input | Output |
|---|---|---|---|
| `/api/ai/detect-event-type` | POST | `{ title, description }` | `{ eventType }` |
| `/api/ai/generate-checklist` | POST | `{ description, eventType }` | `{ items: ChecklistItem[] }` |
| `/api/ai/suggest-preference-fields` | POST | `{ description, eventType }` | `{ fields: PreferenceField[] }` |

All prompts must instruct the model to return **only valid JSON — no markdown fences, no preamble**.

---

## n8n workflows

All notification logic is handled by n8n. The frontend never calls n8n webhooks directly — it calls `POST /api/triggers/:triggerId`, which validates the request and forwards it to n8n with the shared secret.

```
Frontend
    ↓ POST /api/triggers/:triggerId
Vercel Serverless Function
    ↓ POST to n8n webhook URL + N8N_WEBHOOK_SECRET header
n8n workflow
    ↓ sends message via Slack / Email / WhatsApp
```

### Workflows

| Workflow | Trigger | Sends to | Channel |
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

> ⚠️ TODO: currently all n8n calls go to a single `N8N_WEBHOOK_URL`. The webhook payload includes a `type` field (`rsvp_milestone` | `checklist_incomplete` | ...) so n8n can route to the correct workflow. In production, consider using separate webhook URLs per workflow for better isolation.

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
import { events } from '../../_fixtures'

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
  20260318000004_create_preference_fields.sql
  20260318000005_create_notifications.sql
```

Local development with Supabase CLI (requires Docker):
```bash
supabase start          # starts local Postgres + Studio
supabase db reset       # drops DB, applies all migrations + seed.sql
supabase stop
```

---

## Rules for Claude Code

- **Never call external APIs from the frontend** — always proxy through `api/`
- **Never hardcode secrets** — always use `process.env.VARIABLE_NAME`
- **Never commit `.env.local`** — it must be in `.gitignore`
- Every serverless function must validate the HTTP method and return `405` if it doesn't match
- Every serverless function must handle errors and return a meaningful status code — never let an unhandled exception return a `500` with no body
- AI functions must always parse and validate the Claude response before returning it to the frontend — if the response is not valid JSON, return a `502` with a clear error message
- File uploads go directly to Supabase Storage — never pipe binary data through a serverless function

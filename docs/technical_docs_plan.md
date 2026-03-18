# Event OS — Technical Documentation Plan

## Stack & conventions (global)

These rules apply to every feature. Claude Code must follow them without exception.

### Routing
- Use **TanStack Router** for all route definitions
- Every page lives in a route file under `src/routes/`
- Use file-based routing conventions (`_layout.tsx`, `index.tsx`, `$param.tsx`)
- Protected routes (admin, attendee) wrap children with an auth guard component
- Navigation between routes uses `<Link>` or `router.navigate()` from TanStack Router — never `window.location`

### Data fetching & mutations
- Use **TanStack Query** for all server state (fetching, caching, refetching)
- Every API call lives in a dedicated query/mutation hook under `src/hooks/`
- Naming convention: `useGetX()` for queries, `useCreateX()`, `useUpdateX()`, `useDeleteX()` for mutations
- `queryClient.invalidateQueries()` after every successful mutation to keep UI in sync
- No direct `fetch()` calls inside components — always go through a hook

### API layer
- The frontend never calls external APIs directly — all calls go through Vercel Serverless Functions under `api/`
- See `api-layer.md` for the full API layer architecture, environment variables, and serverless function conventions
- All HTTP calls from the frontend go through the shared `src/lib/api.ts` client, which points to `/api`
- Each feature has its own service file in `src/services/` (e.g. `src/services/events.ts`) that uses the shared client
- Secrets (Claude API key, Google OAuth, etc.) live only in serverless functions via `process.env` — never in the frontend

### Forms & validation
- Use **TanStack Form** for all form state management — no controlled components with `useState` for form fields
- Use **Zod** for all validation schemas — define schemas in `src/schemas/` alongside the feature they belong to
- Connect Zod to TanStack Form via the official `@tanstack/zod-form-adapter`
- Naming convention: one schema file per feature, e.g. `src/schemas/event.ts`, `src/schemas/participant.ts`
- Never inline validation logic in components — always import from the schema file
- Reuse partial schemas with `z.pick()` or `z.omit()` when a form only covers a subset of an entity

### Auth
- Google Sign-In via OAuth 2.0
- Auth state managed globally (context or Zustand store)
- On login, store token and user profile (name, email) — do not re-fetch from Google on every render

---

## Feature documentation

---

### F-01 — Create event

**Route:** `/admin/events/new`

**Description:** Admin fills in event basics. AI reads the description and auto-suggests event type and modules to enable.

**Services to consume:**
- `POST /events` — create event
- `POST /ai/detect-event-type` — send title + description, receive suggested event type
- `POST /ai/suggest-modules` *(v2)* — receive boolean flags per module

**Hooks:**
- `useCreateEvent()` — mutation
- `useDetectEventType()` — mutation (called on description blur or button press)

**Notes:**
- AI suggestions are non-blocking — form is usable before AI responds
- Admin can override any AI suggestion
- On success, redirect to `/admin/events/:eventId`

---

### F-02 — Module toggle panel

**Route:** `/admin/events/:eventId` (main event config view)

**Description:** Admin enables/disables modules. Each module is a collapsible panel with its own config fields. Modules are independent — no module should assume another is enabled.

**Services to consume:**
- `GET /events/:eventId` — load current event + module config
- `PATCH /events/:eventId/modules` — save module toggle state

**Hooks:**
- `useGetEvent(eventId)` — query
- `useUpdateEventModules(eventId)` — mutation

**Notes:**
- Module state is persisted on every toggle change (debounced PATCH or explicit save button — TBD)
- Disabled modules must not render their child components

---

### F-03 — Participant list

**Route:** `/admin/events/:eventId/participants`

**Description:** Admin adds attendees by email. Attendees self-complete their profile via Google Sign-In. Admin can edit any attendee's data manually as fallback.

**Services to consume:**
- `GET /events/:eventId/participants` — list attendees
- `POST /events/:eventId/participants` — add attendee by email
- `PATCH /participants/:participantId` — update attendee data (admin override)
- `DELETE /participants/:participantId` — remove attendee

**Hooks:**
- `useGetParticipants(eventId)` — query
- `useAddParticipant(eventId)` — mutation
- `useUpdateParticipant()` — mutation
- `useRemoveParticipant()` — mutation

**Notes:**
- Adding an attendee by email triggers an invite notification (handled by n8n, not the frontend)
- Location field is city + region + country — not just country (needed for cost estimation and document detection)

---

### F-04 — Attendee preference fields

**Route:** Part of F-03 (participant module config)

**Description:** Admin defines custom preference fields per event. AI can suggest fields based on the event description.

**Services to consume:**
- `GET /events/:eventId/preference-fields` — list configured fields
- `POST /events/:eventId/preference-fields` — add field
- `PATCH /preference-fields/:fieldId` — edit field
- `DELETE /preference-fields/:fieldId` — remove field
- `POST /ai/suggest-preference-fields` — send description, receive suggested fields array

**Hooks:**
- `useGetPreferenceFields(eventId)` — query
- `useAddPreferenceField(eventId)` — mutation
- `useSuggestPreferenceFields()` — mutation

---

### F-05 — Pre-event checklist

**Route:** `/admin/events/:eventId/checklist`

**Description:** Admin builds a checklist of items attendees must complete. AI generates a suggested list. Each item can trigger a notification if left incomplete.

**Services to consume:**
- `GET /events/:eventId/checklist` — list items
- `POST /events/:eventId/checklist` — add item
- `PATCH /checklist/:itemId` — edit item
- `DELETE /checklist/:itemId` — remove item
- `POST /ai/generate-checklist` — send description, receive suggested items array

**Hooks:**
- `useGetChecklist(eventId)` — query
- `useAddChecklistItem(eventId)` — mutation
- `useUpdateChecklistItem()` — mutation
- `useDeleteChecklistItem()` — mutation
- `useGenerateChecklist()` — mutation

**Notes:**
- Items with `alertIfIncomplete: true` automatically appear in the notifications module as triggers
- Item types: `checkbox` | `document_upload` | `info_input`

---

### F-06 — Travel & cost estimation

**Route:** `/admin/events/:eventId/budget`

**Description:** Admin enables cost categories. AI estimates cost per person based on attendee locations and event dates. Admin sets max caps per category.

**Services to consume:**
- `GET /events/:eventId/budget` — load budget config and estimates
- `PATCH /events/:eventId/budget` — save category toggles and caps
- `POST /ai/estimate-budget` — send attendees (with locations) + event dates, receive cost breakdown

**Hooks:**
- `useGetBudget(eventId)` — query
- `useUpdateBudget(eventId)` — mutation
- `useEstimateBudget()` — mutation

**Notes:**
- AI estimate is per person per category, not a single total
- Admin can override any AI-estimated value
- Running total max per person must recalculate reactively as caps change

---

### F-07 — Automated notifications

**Route:** `/admin/events/:eventId/notifications`

**Description:** Admin configures when, how, and to whom notifications are sent. Triggers come from two sources: checklist items with `alertIfIncomplete: true`, and fixed milestones (RSVP 50%, event ended).

**Services to consume:**
- `GET /events/:eventId/triggers` — list all triggers (checklist-sourced + milestone)
- `PATCH /triggers/:triggerId` — configure trigger (timing, channel, recipient)
- n8n webhooks are called by the backend — frontend only configures, does not call n8n directly

**Hooks:**
- `useGetTriggers(eventId)` — query
- `useUpdateTrigger()` — mutation

**Notes:**
- Checklist-sourced triggers are read-only in name — only timing/channel/recipient is editable
- Channels: `slack` | `email` | `whatsapp`
- Recipients: `attendee` | `hr_admin` | `both`
- The frontend does not call n8n directly — it calls `api/triggers/:triggerId`, which proxies to n8n. See `api-layer.md` for webhook payloads and authentication details.

---

### F-08 — Event contact info

**Route:** Part of `/admin/events/:eventId` (event config view)

**Description:** Admin defines one or more contact persons for the event. Visible to attendees.

**Services to consume:**
- `GET /events/:eventId/contacts` — list contacts
- `POST /events/:eventId/contacts` — add contact
- `PATCH /contacts/:contactId` — edit contact
- `DELETE /contacts/:contactId` — remove contact

**Hooks:**
- `useGetContacts(eventId)` — query
- `useAddContact(eventId)` — mutation
- `useUpdateContact()` — mutation
- `useDeleteContact()` — mutation

---

### F-09 — Admin dashboard

**Route:** `/admin/events/:eventId/dashboard`

**Description:** Admin monitors event progress: RSVP count, checklist completion per attendee, and trigger activity log.

**Services to consume:**
- `GET /events/:eventId/dashboard` — aggregated stats (RSVP count, completion rates)
- `GET /events/:eventId/participants` — attendee list with checklist status per item
- `GET /events/:eventId/trigger-log` — log of fired notifications

**Hooks:**
- `useGetDashboard(eventId)` — query
- `useGetParticipants(eventId)` — query (reused from F-03)
- `useGetTriggerLog(eventId)` — query

**Notes:**
- Dashboard data should refetch on a short interval or via websocket (TBD) to reflect live RSVP changes during the demo

---

### F-10 — Attendee onboarding (Google Sign-In)

**Route:** `/join/:eventId`

**Description:** Attendee receives an invite link, lands on the event join page, and signs in with Google. Name, last name, and email are auto-filled from Google profile. Attendee then completes remaining required fields.

**Services to consume:**
- Google OAuth 2.0 — handled client-side via Google Identity Services SDK
- `POST /auth/google` — exchange Google token for app session token
- `GET /participants/:participantId/profile` — load attendee's current profile state
- `PATCH /participants/:participantId` — save completed profile fields

**Hooks:**
- `useGoogleSignIn()` — handles OAuth flow, calls `POST /auth/google`
- `useGetMyProfile(participantId)` — query
- `useUpdateMyProfile()` — mutation

---

### F-11 — Attendee event view

**Route:** `/attendee/events/:eventId`

**Description:** Attendee sees event details, their personal checklist, contact persons, and can complete checklist items.

**Services to consume:**
- `GET /events/:eventId` — event details (title, description, date, location)
- `GET /events/:eventId/contacts` — contact persons (reused from F-08)
- `GET /participants/:participantId/checklist` — personal checklist with completion status
- `PATCH /checklist-items/:itemId/complete` — mark item complete / upload document / submit input

**Hooks:**
- `useGetEvent(eventId)` — query (reused from F-02)
- `useGetContacts(eventId)` — query (reused from F-08)
- `useGetMyChecklist(participantId)` — query
- `useCompleteChecklistItem()` — mutation

---

### F-12 — Receipt upload (attendee)

**Route:** Part of `/attendee/events/:eventId` (during/after event)

**Description:** Attendee uploads expense receipts for reimbursement. Each receipt has an amount, category, and file attachment.

**Services to consume:**
- `POST /participants/:participantId/receipts` — upload receipt (multipart/form-data)
- `GET /participants/:participantId/receipts` — list submitted receipts

**Hooks:**
- `useSubmitReceipt()` — mutation
- `useGetMyReceipts(participantId)` — query

**Notes:**
- File upload via multipart — handle loading state carefully (uploads can be slow)
- Accepted formats: PDF, JPG, PNG

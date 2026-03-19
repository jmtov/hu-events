# Event OS — Technical Documentation Plan

## Stack & conventions (global)

These rules apply to every feature. Claude Code must follow them without exception.

### Routing
- Use **TanStack Router** for all route definitions
- Every page lives in a route file under `src/routes/`
- Use file-based routing conventions (`_layout.tsx`, `index.tsx`, `$param.tsx`)
- Navigation between routes uses `<Link>` or `router.navigate()` from TanStack Router — never `window.location`

### Data fetching & mutations
- Use **TanStack Query** for all server state (fetching, caching, refetching)
- Every API call lives in a dedicated query/mutation hook under `src/hooks/`
- Naming convention: `useGetX()` for queries, `useCreateX()`, `useUpdateX()`, `useDeleteX()` for mutations
- `queryClient.invalidateQueries()` after every successful mutation to keep UI in sync
- No direct `fetch()` calls inside components — always go through a hook

### API layer
- The frontend never calls external APIs directly — all calls go through Vercel Serverless Functions under `api/`
- See `api_layer.md` for the full API layer architecture, environment variables, and serverless function conventions
- All HTTP calls from the frontend go through the shared `src/lib/api.ts` client, which points to `/api`
- Each feature has its own service file in `src/services/` (e.g. `src/services/events.ts`) that uses the shared client
- Secrets (Claude API key, etc.) live only in serverless functions via `process.env` — never in the frontend

### Forms & validation
- Use **React Hook Form** for all form state management — no `useState` for form fields
- Use **Zod** for all validation schemas — schemas co-located with their feature in `FeatureName/constants.ts` (no global `src/schemas/` folder)
- Connect via `@hookform/resolvers/zod`
- Never inline validation logic in components — always import from the feature's `constants.ts`
- Form components must be named `<Domain>Form` — e.g. `CreateEventForm`, `AttendeeRegistrationForm`
- Use `<FormProvider>` at the form root so nested field components can access context via `useFormContext()`
- Shared field components live in `src/components/<Input|Select|...>/form.tsx` — they use `Controller` + `useFormContext()` internally

### Auth
- No authentication for MVP — all endpoints and routes are open
- Admin and attendee contexts are separated by URL prefix (`/admin/*` vs `/attendee/*`)

### Save model
- All saves are **full-payload** — the entire form state is sent in a single request
- No partial updates during editing — nothing is persisted until the user explicitly saves
- The backend is responsible for splitting the payload and writing to the correct tables

---

## Feature documentation

---

### F-00 — Admin event list

**Route:** `/admin/events`

**Description:** Landing screen for admins. Shows all events with key metadata per card (name, date, status, RSVP count). Provides navigation to create a new event or enter an existing one. Supports deleting an event with an explicit confirmation step.

**Services to consume:**
- `GET /api/admin/events` — list all events with RSVP count
- `DELETE /api/events/:eventId` — delete event and all associated data

**Hooks:**
- `useGetAdminEvents()` — query
- `useDeleteEvent()` — mutation (requires confirmation before calling)

**Notes:**
- Event status badge (upcoming / ongoing / past) is derived client-side from `date_start` and `date_end`
- Deletion is permanent — UI must show a confirmation dialog before calling the endpoint
- On successful deletion, invalidate the admin events query

---

### F-01 — Create & edit event

**Routes:**
- `/admin/events/new` — create
- `/admin/events/:eventId/edit` — edit (same form component, pre-populated)

**Description:** A single form used for both creating and editing an event. Event basics at the top (title, description, date/time, event type, and a free-text `event_day_info` field — visible to attendees only on the event day). Below the basics, five toggleable module sections — each is an independent collapsible row. Enabling a module expands its inline config; disabling it collapses and unmounts it.

The entire form state is saved in one request on submit. There are no intermediate saves. AI suggestions (event type, module flags, checklist items, preference fields) are non-blocking — the form is fully usable before the AI responds.

> ⚠️ TODO: evolve `event_day_info` into a structured agenda builder in a future iteration.

**Services to consume:**
- `POST /api/events` — create event (full payload: basics + module toggles + participants + checklist + preference fields)
- `GET /api/events/:eventId` — load existing event for edit mode
- `PUT /api/events/:eventId` — save edits (full payload, same shape as create)
- `POST /api/ai/detect-event-type` — send title + description, receive suggested event type
- `POST /api/ai/generate-checklist` — send description + eventType, receive suggested checklist items
- `POST /api/ai/suggest-preference-fields` — send description + eventType, receive suggested preference fields

**Hooks:**
- `useCreateEvent()` — mutation (create mode)
- `useGetEvent(eventId)` — query (edit mode)
- `useUpdateEvent(eventId)` — mutation (edit mode)
- `useDetectEventType()` — mutation (called on description blur)
- `useGenerateChecklist()` — mutation (called from inside the checklist module row)
- `useSuggestPreferenceFields()` — mutation (called from inside the preference fields module row)

**Notes:**
- AI suggestions are non-blocking — admin can override any suggestion
- Module toggles are part of the form payload — both create and update include the full module state
- **Participants** are entered as a list of emails inside the participant module toggle row — no separate participants page
- **Checklist items** are drafted inside the checklist module toggle row — no separate checklist page
- **Preference fields** are defined inside the preference fields module toggle row — no separate page
- On create success: redirect to `/admin/events/:eventId` (summary page)
- On edit success: redirect to `/admin/events/:eventId`

---

### F-02 — Event summary page

**Route:** `/admin/events/:eventId`

**Description:** Post-creation summary view. Shows the event title, type, date, location, and a quick summary of enabled modules. Serves as the landing page after creating or editing an event. Provides navigation to edit the event.

**Services to consume:**
- `GET /api/events/:eventId` — load event details
- `GET /api/events/:eventId/participants` — quick participant count (reused from the summary card)

**Hooks:**
- `useGetEvent(eventId)` — query
- `useGetParticipants(eventId)` — query (for the participant summary card)

**Notes:**
- Displays a success banner after creation (navigated to from F-01 with `?created=true`)
- No module configuration here — all config lives in the edit form (F-01)
- Participant summary card shows up to 5 participants with RSVP badge and a link to the full participant list

---

### F-03 — Participant management (inline, part of F-01)

**Route:** n/a — configured inline within the event create/edit form (F-01)

**Description:** Admin adds attendees by email inside the participant module toggle row. The list is saved as part of the full event payload. Participant management after initial creation is done via the edit form.

**Services to consume (via the parent event save):**
- `POST /api/events` / `PUT /api/events/:eventId` — participants sent as part of the full event payload

**Notes:**
- Participants are a list of `{ email }` objects inside the form payload
- No standalone participant page or dedicated participant API calls from the frontend
- On create/update, the backend inserts new participants and removes removed ones
- Invite notifications are sent by the backend — the frontend does not call any invite endpoint

---

### F-04 — Attendee preference fields (inline, part of F-01)

**Route:** n/a — configured inline within the event create/edit form (F-01)

**Description:** Admin defines custom preference fields per event. AI can suggest fields based on the event description. Fields are defined inside the preference fields module toggle row.

**Services to consume (via the parent event save):**
- `POST /api/events` / `PUT /api/events/:eventId` — preference fields sent as part of the full event payload
- `POST /api/ai/suggest-preference-fields` — send description, receive suggested fields array

**Hooks:**
- `useSuggestPreferenceFields()` — mutation (non-blocking)

---

### F-05 — Pre-event checklist (inline, part of F-01)

**Route:** n/a — configured inline within the event create/edit form (F-01)

**Description:** Admin builds a checklist of items attendees must complete. AI generates a suggested list. Each item can trigger a notification if left incomplete. The checklist is drafted inside the checklist module toggle row.

**Services to consume (via the parent event save):**
- `POST /api/events` / `PUT /api/events/:eventId` — checklist items sent as part of the full event payload
- `POST /api/ai/generate-checklist` — send description + eventType, receive suggested items

**Hooks:**
- `useGenerateChecklist()` — mutation (non-blocking)

**Notes:**
- Item types: `checkbox` | `document_upload` | `info_input`
- Items with `alertIfIncomplete: true` automatically appear in the notifications module as triggers
- The same checklist applies to all attendees — no per-person customization in MVP

---

### F-06 — Automated notifications

**Route:** n/a — configured inline within the event create/edit form (F-01), under the notifications module toggle row

**Description:** Admin configures when, how, and to whom notifications are sent. Triggers come from two sources: checklist items with `alertIfIncomplete: true`, and fixed milestones (RSVP 50%, event ended). Notification config is part of the full event payload.

**Services to consume:**
- `POST /api/triggers/:triggerId` — proxy a trigger action to n8n (frontend-initiated triggers only)

**Notes:**
- Checklist-sourced triggers are defined by which checklist items have `alertIfIncomplete: true`
- Fixed milestone triggers (RSVP 50%, event ended) are created automatically by the backend
- The frontend does not call n8n directly — it calls `POST /api/triggers/:triggerId`, which proxies to n8n
- See `api_layer.md` for webhook payloads and authentication details

---

### F-07 — Attendee onboarding

**Route:** `/join/:eventId`

**Description:** Attendee lands on the event join page (linked from invite email or shared directly). They enter their name, location, and any required preference fields, then confirm their RSVP. No authentication required for MVP.

**Services to consume:**
- `GET /api/events/:eventId` — load event details (title, description, date, preference fields)
- `PATCH /api/events/:eventId/attendance` — save profile + RSVP (`action: 'profile'` then `action: 'rsvp'`)

**Hooks:**
- `useGetEvent(eventId)` — query
- `useAttendanceAction(eventId)` — mutation (action-based)

**Notes:**
- No session or token — attendee is identified by email (entered as part of the profile action)
- On submit, sends `action: 'profile'` with name/email/location, followed by `action: 'rsvp'` with `status: 'confirmed'`
- After saving, redirect to `/attendee/events/:eventId`

---

### F-08 — Attendee event view

**Route:** `/attendee/events/:eventId`

**Description:** Attendee sees event details, their personal checklist, and contact persons. Can complete checklist items (pre-event). During and after the event, the same route surfaces event info (directions, agenda) and allows file uploads. The view adapts based on the event's current phase (pre / during / post).

**Services to consume:**
- `GET /api/events/:eventId` — event details (title, description, date, location, event_day_info, contacts)
- `PATCH /api/events/:eventId/attendance` — all attendee actions:
  - `action: 'rsvp'` — confirm or decline
  - `action: 'checklist_item'` — mark item complete / submit input
  - `action: 'upload'` — record file path after direct upload to Supabase Storage
  - `action: 'profile'` — update profile fields

**File upload flow:**
1. Call `POST /api/upload/sign` to get a signed URL
2. Upload directly to Supabase Storage using the signed URL
3. Call `PATCH /api/events/:eventId/attendance` with `action: 'upload'` and the resulting `filePath`

**Hooks:**
- `useGetEvent(eventId)` — query
- `useAttendanceAction(eventId)` — mutation (handles all action types)
- `useGetSignedUploadUrl()` — mutation (step 1 of file upload flow)

**Notes:**
- Phase is derived client-side from event date: `pre` = before event date, `during` = event day, `post` = after event date
- `event_day_info` is rendered only in `during` and `post` phases
- No visibility into other attendees' progress
- Attendee is identified by email (stored in localStorage after onboarding — no session token)

---

### F-09 — Attendee event list

**Route:** `/attendee/events`

**Description:** The attendee lands on a list of all events they have been invited to. Each card shows the event name, date, and their RSVP status. Clicking a card navigates to the attendee event view (F-08).

**Services to consume:**
- `GET /api/events` — list events filtered by attendee email

**Hooks:**
- `useGetMyEvents()` — query (passes attendee email as a query param)

**Notes:**
- Default landing route for attendees after onboarding
- Attendee email is read from localStorage (set during onboarding in F-07)

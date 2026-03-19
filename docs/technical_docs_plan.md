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
- Use **React Hook Form** for all form state management — no `useState` for form fields
- Use **Zod** for all validation schemas — schemas co-located with their feature in `FeatureName/constants.ts` (no global `src/schemas/` folder)
- Connect via `@hookform/resolvers/zod`
- Never inline validation logic in components — always import from the feature's `constants.ts`
- Form components must be named `<Domain>Form` — e.g. `CreateEventForm`, `AttendeeRegistrationForm`
- Use `<FormProvider>` at the form root so nested field components can access context via `useFormContext()`
- Shared field components live in `src/components/<Input|Select|...>/form.tsx` — they use `Controller` + `useFormContext()` internally

### Auth
- **Admin:** Google Sign-In via OAuth 2.0 — on login, redirect to `/admin/events`
- **Attendee:** Email magic link (no password) — attendee clicks a link in their invite or requests a new one; the link carries a short-lived token that is verified server-side to create a session
- After a successful magic link verification, attendees can optionally connect their Google account to auto-fill name, last name, and email in their profile
- A person can have both roles (admin and attendee) under the same email. When the backend confirms dual roles, a switcher appears in the app header that navigates to the other context's event list
  - The switcher calls `GET /auth/me/roles` to determine whether to show it — do not show it speculatively
- Sessions are persistent — token stored in `localStorage` with a 30-day expiration
- Admin role is verified via `GET /auth/me/roles` — never inferred client-side from the token payload
- Auth state managed globally (context or Zustand store)
- On login, store token and user profile (name, email) — do not re-fetch from the identity provider on every render

---

## Feature documentation

---

### F-00 — Admin event list

**Route:** `/admin/events`

**Description:** Landing screen for admins. Shows all events created by the admin with key metadata per card (name, date, status, RSVP count). Provides navigation to create a new event or enter an existing one. Supports deleting an event with an explicit confirmation step.

**Services to consume:**
- `GET /admin/events` — list all events with RSVP count
- `DELETE /events/:eventId` — delete event and all associated data (participants, checklist, budget, triggers, contacts)

**Hooks:**
- `useGetAdminEvents()` — query
- `useDeleteEvent()` — mutation (requires confirmation before calling)

**Notes:**
- Event status badge (upcoming / ongoing / past) is derived client-side from `date_start` and `date_end`
- Deletion is permanent and irreversible — UI must show a confirmation dialog before calling the endpoint
- On successful deletion, invalidate the admin events query to update the list

---

### F-01 — Create & edit event

**Routes:**
- `/admin/events/new` — create
- `/admin/events/:eventId/edit` — edit (same form component, pre-populated)

**Description:** A single form used for both creating and editing an event. Event basics at the top (title, description, date/time, event type, and a free-text `event_day_info` field — visible to attendees only on the event day). Below the basics, five toggleable module sections — each is an independent collapsible row. Enabling a module expands its inline config; disabling it collapses and unmounts it. AI auto-detects event type on description blur and auto-suggests which modules to enable.

> ⚠️ TODO: evolve `event_day_info` into a structured agenda builder in a future iteration.

**Services to consume:**
- `POST /events` — create event (includes initial module toggle state and `event_day_info`)
- `GET /events/:eventId` — load existing event for edit mode
- `PATCH /events/:eventId` — save edits (event basics + module state)
- `DELETE /events/:eventId` — delete event and all associated data (called from the event list, not this form — see F-00)
- `POST /ai/detect-event-type` — send description, receive suggested event type
- `POST /ai/suggest-modules` — send description, receive boolean flags per module
- `POST /ai/generate-checklist` — receive suggested checklist items (same endpoint as F-05)

**Hooks:**
- `useCreateEvent()` — mutation (create mode)
- `useGetEvent(eventId)` — query (edit mode, to pre-populate the form)
- `useUpdateEvent(eventId)` — mutation (edit mode)
- `useDetectEventType()` — mutation (called on description blur)
- `useSuggestModules()` — mutation (called on description blur, non-blocking)
- `useGenerateChecklist()` — mutation (reused from F-05, called from inside the checklist module row)

**Notes:**
- AI suggestions are non-blocking — form is usable before AI responds
- Admin can override any AI suggestion
- Modules are part of the form payload — `POST /events` and `PATCH /events/:eventId` both include the full module toggle state
- The checklist module row expands to show the full checklist builder (add/edit/delete items, AI generation) — no separate navigation required for initial setup
- Checklist items drafted during creation are saved via `POST /events/:eventId/checklist` after the event is created, before redirecting
- Invites to participants are sent automatically by the backend when the event is saved — the frontend does not call any invite endpoint directly; on subsequent saves, only newly added participants receive an invite
- On create success: redirect to `/admin/events/:eventId` (summary page)
- On edit success: redirect to `/admin/events/:eventId` or back to the event list (TBD)

---

### F-02 — Event summary page

**Route:** `/admin/events/:eventId`

**Description:** Post-creation summary view. Shows the event title, type, date, and location. Serves as the landing page after creating a new event. No module configuration here — all config lives in the create/edit form (F-01).

**Services to consume:**
- `GET /events/:eventId` — load event details

**Hooks:**
- `useGetEvent(eventId)` — query

**Notes:**
- Displays a success banner after creation (navigated to from F-01)
- Provides a link to create another event
- Does not manage module state — modules are configured in F-01

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

**AI services:**
- `POST /ai/detect-document-requirements` — send attendee locations array, receive required documents per location (e.g. passport required for Spain)

**Additional hooks:**
- `useDetectDocumentRequirements()` — mutation (called when attendee locations change)

**Notes:**
- Adding an attendee by email triggers an invite notification (handled by n8n, not the frontend)
- Location field is city + region + country — not just country (needed for cost estimation and document detection)
- Document requirements are surfaced as a suggestion to the admin — admin decides whether to add a document upload item to the checklist

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
- The same checklist applies to all attendees — no per-person customization in MVP
- New attendees added after the first save receive the checklist as it stands at that moment — the backend handles this on participant creation
- ⚠️ TODO: define behavior when admin edits checklist items after attendees have already recorded progress (e.g. deleting an item that has completions)

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
- Attendees can see their budget allocation per category in their event view (F-11) — the `GET /events/:eventId/budget` endpoint must return attendee-visible data

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
- Fixed milestone triggers come pre-loaded with defaults:
  - RSVP hits 50% → Slack → HR admin
  - Event ended → Email → all attendees
- The condition of milestone triggers (50% threshold, event end date) is immutable — only timing, channel, and recipient are configurable
- Changes to a trigger's config apply only to future sends — already-sent notifications are not affected
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

**Description:** Separate screen accessible from the event detail screen, visible only to the admin who created the event. Admin monitors live event progress: RSVP count vs total expected attendees, checklist completion per attendee per item, and trigger activity log (what fired, when, through which channel, and to whom). Data refetches automatically on a short interval.

**Services to consume:**
- `GET /events/:eventId/dashboard` — aggregated stats (RSVP count, completion rates)
- `GET /events/:eventId/participants` — attendee list with checklist status per item
- `GET /events/:eventId/trigger-log` — log of fired notifications

**Hooks:**
- `useGetDashboard(eventId)` — query
- `useGetParticipants(eventId)` — query (reused from F-03)
- `useGetTriggerLog(eventId)` — query

**Notes:**
- Dashboard data refetches on a short polling interval — websocket is out of scope for now
- Only the event creator can access this screen — enforce on both the API (`GET /events/:eventId/dashboard` returns 403 for non-creators) and the route guard

---

### F-10 — Attendee onboarding

**Route:** `/join/:eventId`

**Description:** Attendee receives an invite email or a direct magic link. Clicking it lands them on the event join page. The link carries a short-lived token; the server validates it and creates a session. After auth, the attendee can optionally connect Google to auto-fill their name, last name, and email. They then complete any remaining required profile fields.

**Auth flow:**
1. Attendee lands on `/join/:eventId?token=<magic-token>` (from invite email or explicit magic link request)
2. `POST /auth/magic-link/verify` validates the token → returns session token + participant ID
3. Attendee optionally clicks "Auto-fill with Google" → Google OAuth flow → `POST /auth/google/connect` — links Google profile, auto-fills name/last name/email
4. Attendee completes remaining required fields and saves

**Services to consume:**
- `POST /auth/magic-link/verify` — validate token, create session
- `POST /auth/magic-link/request` — request a new magic link (for expired links)
- `POST /auth/google/connect` — optional; link Google account to auto-fill profile fields
- `GET /participants/:participantId/profile` — load attendee's current profile state
- `PATCH /participants/:participantId` — save completed profile fields

**Hooks:**
- `useVerifyMagicLink()` — mutation, called on mount with token from URL
- `useRequestMagicLink()` — mutation, for expired link recovery
- `useConnectGoogle()` — mutation, optional Google profile auto-fill
- `useGetMyProfile(participantId)` — query
- `useUpdateMyProfile()` — mutation

---

### F-11 — Attendee event view

**Route:** `/attendee/events/:eventId`

**Description:** Attendee sees event details, their personal checklist, contact persons, and can complete checklist items (pre-event). During and after the event, the same route surfaces event info (directions, agenda) and allows receipt uploads. The view adapts based on the event's current phase (pre / during / post).

**Services to consume:**
- `GET /events/:eventId` — event details (title, description, date, location, directions, agenda)
- `GET /events/:eventId/contacts` — contact persons (reused from F-08)
- `GET /participants/:participantId/checklist` — personal checklist with completion status
- `PATCH /checklist-items/:itemId/complete` — mark item complete / upload document / submit input

**Hooks:**
- `useGetEvent(eventId)` — query (reused from F-02)
- `useGetContacts(eventId)` — query (reused from F-08)
- `useGetMyChecklist(participantId)` — query
- `useCompleteChecklistItem()` — mutation

**Notes:**
- Phase is derived from event date: `pre` = before event date, `during` = event day, `post` = after event date
- `event_day_info` (agenda / what's happening) is part of the event entity — rendered only in `during` and `post` phases; do not surface it in `pre`
- Receipt upload (F-12) is surfaced in the `during` and `post` phases from within this same view
- Attendee's checklist shows no visibility into other attendees' progress
- Checklist item actions and their editability by phase:
  - RSVP confirmation — toggle, reversible at any time
  - Document uploads — replaceable at any time
  - Info inputs (preferences, dietary, etc.) — editable at any time
  - Checkbox tasks — reversible at any time
- If the budget module is enabled, attendees see their allocation per category (sourced from `GET /events/:eventId/budget`)

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

---

### F-13 — Attendee event list

**Route:** `/attendee/events`

**Description:** After signing in, the attendee lands on a list of all events they have been invited to. Each card shows the event name, date, and the attendee's overall checklist completion status. Clicking a card navigates to the attendee event view (F-11).

**Services to consume:**
- `GET /participants/me/events` — list all events the authenticated attendee is invited to, with their checklist completion percentage per event

**Hooks:**
- `useGetMyEvents()` — query

**Notes:**
- This is the default landing route for authenticated attendees — after magic link verification (F-10), redirect here if no specific event context is present
- Checklist completion is a percentage derived server-side (completed items / total required items)

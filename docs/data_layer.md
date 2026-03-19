# Event OS — Data Layer

## Overview

The frontend never fetches event data from multiple endpoints. Every screen that needs event information makes a **single call** to `GET /api/events/:eventId`, which returns a fully composed event object. The serverless function assembles that object from multiple data sources before returning it.

This keeps the frontend simple: it receives one object, it renders it. All data composition logic lives server-side.

---

## Composed event response (`EventDetail`)

`GET /api/events/:eventId` returns the following shape. This maps directly to the `EventDetail` type in `src/types/event.ts`.

```ts
type EventDetail = {
  // Core event fields
  id: string
  title: string
  description: string
  event_type: string               // free-text; common values: 'hr_retreat' | 'hackathon' | 'workshop' | 'bdr_call' | 'other'
  date_start: string               // ISO 8601
  date_end: string | null          // ISO 8601; null if single-day
  location: string | null
  expected_attendees: number | null
  event_day_info: string | null    // free-text shown to attendees on event day
  created_at: string               // ISO 8601
  updated_at: string               // ISO 8601

  // Module toggle flags — always present
  modules: {
    participantList: boolean
    checklist: boolean
    budget: boolean
    notifications: boolean
    contacts: boolean
  }

  // Embedded module data — populated regardless of module toggle;
  // the frontend uses the `modules` flags to decide what to render,
  // not the presence or absence of data
  participants: Participant[]
  checklist: ChecklistEntry[]
  triggers: Trigger[]
}
```

> **Rule:** never add a second API call in the frontend to fetch event sub-resources. All of that comes from this single endpoint. The `EventDetail` type is the single source of truth — do not create parallel types for sub-resources.

---

## Nested types

All types below live in `src/types/` and match the shapes returned by the API.

### `Participant` — `src/types/participant.ts`

```ts
type Participant = {
  id: string
  event_id: string
  email: string
  full_name: string
  google_uid: string | null
  location_city: string | null
  location_region: string | null
  location_country: string | null
  rsvp_status: 'pending' | 'confirmed' | 'declined'
  created_at: string               // ISO 8601
  updated_at: string               // ISO 8601
}
```

### `ChecklistEntry` — `src/types/event.ts`

```ts
type ChecklistEntry = {
  id: string
  event_id: string
  label: string
  item_type: 'checkbox' | 'document_upload' | 'info_input'
  required: boolean
  alert_if_incomplete: boolean
  sort_order: number
}
```

### `Trigger` — `src/types/trigger.ts`

```ts
type Trigger = {
  id: string
  eventId: string
  name: string
  source: 'milestone' | 'checklist'
  timing: 'immediately' | 'days_before' | 'hours_after'
  timingValue: number              // 0 when timing is 'immediately'
  channel: 'slack' | 'email' | 'whatsapp'
  recipient: 'attendee' | 'hr_admin' | 'both'
}
```

> Note: `timing` is self-contained — there is no separate `timingUnit` field. `days_before` and `hours_after` encode both the direction and the unit.

---

## Not yet implemented

The following modules are defined in `EventModules` and togglable in the form, but have no data model or API support yet:

| Module | Flag | Status |
|---|---|---|
| Budget | `modules.budget` | Pending |
| Contacts | `modules.contacts` | Pending |

When implemented, `EventDetail` will grow two additional fields: `budget: BudgetConfig | null` and `contacts: ContactPerson[]`. The composition logic in `api/events/[eventId].ts` will be extended to populate them.

---

## Server-side composition

`api/events/[eventId].ts` handles `GET` requests by:

1. Reading the event record from the events store
2. Filtering participants for that `eventId`
3. Filtering checklist items for that `eventId`
4. Filtering triggers for that `eventId`
5. Assembling all of the above into a single `EventDetail` object and returning it as JSON

### Current implementation (JSON file stores)

Data is read and written through store modules in `api/_lib/`:

| Store module | Backing file | Entity |
|---|---|---|
| `mock-store.ts` | `_fixtures/store/events.json` | Events |
| `participant-store.ts` | `_fixtures/store/participants.json` | Participants |
| `checklist-store.ts` | `_fixtures/store/checklist.json` | Checklist items |
| `trigger-store.ts` | `_fixtures/store/triggers.json` | Notification triggers |
| `preference-field-store.ts` | `_fixtures/store/preference-fields.json` | Preference fields |

Each store module exports `read*()` and `write*()` functions. Serverless handlers call these — they never read or write JSON files directly.

Store files are gitignored. When no store file exists on disk, the read function falls back to the corresponding seed data in `api/_fixtures/`.

### Future implementation (Supabase)

Each store module maps 1:1 to a Supabase table. The migration is a **drop-in replacement** inside each `_lib/` module — the handler's composition logic and the `EventDetail` response shape stay identical. Only the `read*`/`write*` implementations change.

| Store module | Supabase table |
|---|---|
| `mock-store.ts` | `events` |
| `participant-store.ts` | `participants` |
| `checklist-store.ts` | `checklist_items` |
| `trigger-store.ts` | `notification_triggers` |
| `preference-field-store.ts` | `preference_fields` |

---

## Event creation — server-side write flow

`POST /api/events` receives the full form state in a single payload and writes all sub-resources atomically.

### Request payload (`CreateEventPayload`) — `src/types/event.ts`

```ts
type CreateEventPayload = {
  // Event basics
  title: string
  description: string
  event_type: string
  date_start: string               // ISO 8601
  date_end?: string                // ISO 8601
  location?: string
  expected_attendees?: number
  event_day_info?: string

  // Module toggles
  modules?: Partial<EventModules>

  // Module data — omit or send undefined to skip writing that module
  participants?: Array<{ email: string }>
  checklist?: ChecklistItemPayload[]
  preferenceFields?: PreferenceFieldPayload[]
  triggers?: TriggerPayload[]
}
```

### Server-side write sequence

1. Generate a new `eventId` and write the event record
2. If `modules.participantList` and `participants` is non-empty → write participant records
3. If `modules.checklist` and `checklist` is non-empty → write checklist item records
4. If `modules.participantList` and `preferenceFields` is non-empty → write preference field records
5. If `modules.notifications` and `triggers` is non-empty → write trigger records
6. Return the created `Event` (without embedded sub-resources — the client navigates to the detail view, which fetches `EventDetail`)

> **Rule:** the frontend always sends the full form state on save — never partial updates per module. The serverless handler owns the write sequence.

### Event update — `PUT /api/events/:eventId`

Follows the same payload shape. All sub-resources for the event are **replaced** in full — existing records not present in the new payload are deleted. There are no partial-update or patch semantics for sub-resources.

---

## Admin event list

`GET /api/admin/events` returns a lightweight summary for each event, without embedded sub-resources:

```ts
type AdminEventSummary = Event & {
  rsvp_count: number               // count of participants with rsvp_status = 'confirmed'
}
```

This is the only endpoint where `rsvp_count` appears. The detail view derives RSVP stats from the embedded `participants` array in `EventDetail`.

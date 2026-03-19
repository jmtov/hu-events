# EventCreateForm

Form for admins to create a new event. Implements F-01 from `docs/technical_docs_plan.md`.

## Route

`/admin/events/new`

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Form component — fields, AI detection, submit handler |
| `types.ts` | `EventCreateValues` (inferred from schema) |
| `constants.ts` | Zod validation schema, references `EVENT_TYPES` from `src/types/event.ts` |

## Endpoints

| Hook | Endpoint | Purpose |
|---|---|---|
| `useCreateEvent()` | `POST /events` | Creates the event, redirects to `/admin/events/:eventId` on success |
| `useDetectEventType()` | `POST /ai/detect-event-type` | Suggests an event type from the description — non-blocking |

## Notes

- AI detection fires on `description` blur via `FormTextarea`'s `onBlur` prop.
- The suggested `event_type` is only applied if the admin hasn't already changed the field from its default value (`other`).
- Cancel navigates to `/` until the admin events list route (`/admin/events`) is implemented.
- `date_end` and `location` are optional — sent as `undefined` if empty.

# HumandRegistrationPage

Registration page for attendees — complete profile and RSVP for an event.

## Route

`/join/:eventId` — public, no auth required.

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Main page — form orchestration, loading/error states, submit handler |
| `types.ts` | `RegistrationValues` (inferred from schema) |
| `constants.ts` | Zod validation schema |
| `components/EventHeader.tsx` | Event info card above the form |
| `components/SuccessScreen.tsx` | Confirmation screen after successful RSVP |

## Endpoints

| Hook | Endpoint | Purpose |
|---|---|---|
| `useGetEvent(eventId)` | `GET /events/:eventId` | Load event title, description, dates, location |
| `useGetPreferenceFields(eventId)` | `GET /events/:eventId/preference-fields` | Load dynamic preference fields defined by the admin |

## Notes

- Preference fields are rendered dynamically from the API — no hardcoded fields.
- `field_type === 'select'` renders `FormSelect`; everything else renders `FormInput`.
- The preferences card is hidden entirely when the event has no preference fields.
- Loading and not-found states are handled before rendering the form.

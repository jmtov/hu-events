# HumandRegistrationPage

Demo registration page for attendees to complete their profile and RSVP.

## Route

Not yet connected to TanStack Router. Intended for `/join/:eventId` once the event endpoint is ready (see F-10 in `docs/technical_docs_plan.md`).

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Main page — form orchestration, submit handler |
| `types.ts` | Local types: `Event`, `PreferenceField`, `RegistrationValues` |
| `constants.ts` | Zod schema, `DEMO_EVENT`, `DEMO_PREFERENCE_FIELDS` |
| `EventHeader.tsx` | Event info card shown above the form |
| `SuccessScreen.tsx` | Confirmation screen shown after successful RSVP |

## Endpoints

None yet — event data and preference fields are hardcoded as `DEMO_*` constants. Replace with:
- `GET /events/:eventId` — event details
- `GET /events/:eventId/preference-fields` — dynamic preference fields

## Notes

- `DEMO_EVENT` and `DEMO_PREFERENCE_FIELDS` are placeholders. Remove once the API is connected.
- `useState(submitted)` is the only local UI state — all form fields use react-hook-form.
- `z.record(z.string(), z.string())` — Zod v4 requires both key and value schemas for records.

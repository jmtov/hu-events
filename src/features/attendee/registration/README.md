# Attendee Registration

Demo registration page for attendees to complete their profile and RSVP.

## Route

Not yet connected to TanStack Router. Intended for `/join/:eventId` once the event endpoint is ready (see F-10 in `docs/technical_docs_plan.md`).

## Key files

| File | Purpose |
|---|---|
| `HumandRegistrationPage.tsx` | Main page — form orchestration, submit handler |
| `EventHeader.tsx` | Event info card shown above the form |
| `SuccessScreen.tsx` | Confirmation screen shown after RSVP |
| `src/components/Select/form.tsx` | Shared form-connected select (reusable) |

## Endpoints

None yet — event data and preference fields are hardcoded as `DEMO_*` constants. Replace with:
- `GET /events/:eventId` — event details
- `GET /events/:eventId/preference-fields` — dynamic fields

## Notes

- `DEMO_EVENT` and `DEMO_PREFERENCE_FIELDS` are placeholders. Remove once the API is connected.
- Preference fields use `z.record(z.string(), z.string())` — Zod v4 requires both key and value schemas.
- `useState(submitted)` is the only local UI state — form fields use react-hook-form.

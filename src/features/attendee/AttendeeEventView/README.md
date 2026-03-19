# AttendeeEventView

Attendee's personal event dashboard — shown after they complete registration via the join link.

## Route

`/attendee/events/:eventId`

## Key files

- `index.tsx` — main component
- Hooks: `useGetEvent(eventId)`, `useGetParticipantData(eventId, email)`
- Service: `src/services/attendance.ts` (`getParticipantData`)
- i18n: `public/locales/*/attendee.json` → `eventView.*`

## Endpoints

- `GET /api/events/:eventId` — event details (title, date, location, modules, checklist items)
- `GET /api/events/:eventId/participant?email=...` — participant profile + merged checklist with completion status

## Identity

No session token in MVP. The attendee's email is read from `sessionStorage('humand_attendee_email')`, written there by `HumandRegistrationPage` on successful registration.

TODO: replace sessionStorage email with a proper session/magic-link token once attendee auth is implemented.

## Status

- [x] Event header (title, type, date, location)
- [x] RSVP confirmation banner
- [x] Submitted info card (name, email, city, region, country)
- [x] Checklist items with completion status (pending/done)
- [ ] Checklist item completion — interactive (future iteration)
- [ ] Document upload flow (future iteration)
- [ ] "Today" section on event day (event_day_info)

## Notes

- If `email` is null (direct navigation without registration), shows a prompt to use the invite link
- Checklist items are read-only for now — completion will be implemented in a future iteration

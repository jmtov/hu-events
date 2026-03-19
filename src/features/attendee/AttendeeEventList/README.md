# AttendeeEventList

Lists all events the attendee is registered for, with RSVP status and checklist progress per event.

## Route

`/attendee/events`

## Key files

- `index.tsx` — list component
- Hook: `useGetAttendeeEvents(email)`
- Service: `src/services/attendee.ts`
- i18n: `public/locales/*/attendee.json` → `eventList.*`

## Endpoints

- `GET /api/attendee/events?email=...` — returns events + rsvp_status + checklist_total/completed per event

## Status

- [x] Event cards with title, date, location, status badge
- [x] RSVP status badge per event
- [x] Checklist completion count (X/Y tasks)
- [x] "Change email" escape hatch
- [x] Empty state
- [x] Guard: redirects to /attendee/login if no email in sessionStorage
- [ ] Checklist completion % as a progress bar (future)

## Notes

Email is read from `sessionStorage('humand_attendee_email')`. The route's `beforeLoad` guard redirects to `/attendee/login` if the key is missing.

# AdminEventList

Landing screen for admins after login. Shows all events created by the admin with key metadata per card.

## Route
`/admin/events`

## Key files
- `index.tsx` — main component
- `src/hooks/useGetAdminEvents.ts` — data fetching hook
- `src/services/events.ts` — `getAdminEvents()` service call

## Endpoints
- `GET /api/admin/events` — returns all events with `rsvp_count` per event

## Notes
- Event status (`upcoming` / `ongoing` / `past`) is derived client-side from `date_start` and `date_end`
- RSVP count is the number of participants with `rsvp_status === 'confirmed'`, computed server-side
- Empty state renders when the events array is empty, with a CTA to create the first event

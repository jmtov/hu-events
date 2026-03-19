# AdminEventList

Landing screen for admins after login. Shows all events created by the admin with key metadata per card.

## Route

`/admin/events`

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Main component — list, loading, empty state |
| `src/hooks/useGetAdminEvents.ts` | Query hook |
| `src/services/events.ts` | `getAdminEvents()` service call |

## Endpoints

| Hook | Endpoint | Purpose |
|---|---|---|
| `useGetAdminEvents()` | `GET /api/admin/events` | Returns all events with `rsvp_count` |
| `useDeleteEvent()` | `DELETE /api/events/:eventId` | Delete event and all associated data |

## Status

- [x] Event list with loading and error states
- [x] Empty state with create CTA
- [x] Event status badge (upcoming / ongoing / past) derived client-side
- [x] RSVP count per card
- [ ] Delete event with confirmation dialog (`useDeleteEvent`)
- [ ] Search / filter
- [ ] Pagination or infinite scroll

## Notes

- Event status is derived client-side from `date_start` and `date_end`
- RSVP count is computed server-side (`rsvp_status === 'confirmed'`)
- Empty state renders when the events array is empty
- Deletion is permanent — UI must require explicit confirmation before calling the endpoint

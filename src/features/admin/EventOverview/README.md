# EventOverview

Post-save landing page that shows an admin the event summary, RSVP count breakdown, and checklist completion percentage after creating or revisiting an event.

## Route

`/admin/events/:eventId`

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Main component — orchestrates data fetching and layout |
| `components/SavedBanner.tsx` | Dismissible success banner shown when `?created=true` |
| `components/EventHeader.tsx` | Event title, type badge, date range, and location |
| `components/RsvpCard.tsx` | RSVP count with confirmed/pending/declined breakdown and progress bar |
| `components/ChecklistProgressCard.tsx` | Per-item checklist completion % with overall average |

## Hooks used

- `useGetEvent(eventId)` — fetches event data
- `useGetParticipants(eventId)` — fetches participant list with RSVP statuses
- `useGetEventChecklist(eventId)` — fetches checklist items with per-item completion stats

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/events/:eventId` | Event data |
| `GET` | `/api/events/:eventId/participants` | Participant list |
| `GET` | `/api/events/:eventId/checklist` | Checklist items with completion stats |

## Notes

- The saved banner is controlled by the `?created=true` search param set by `EventCreateForm` on navigate.
- All checklist completion stats are aggregated server-side in `api/events/[eventId]/checklist.ts`.
- `USE_MOCK_DATA=true` in `.env` makes all three endpoints return fixture data from `api/_fixtures/`.

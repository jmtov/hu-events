# Trigger Activity Log (F-09)

Displays a log of all fired notifications for an event, so the admin can audit what was sent, to whom, and whether it was delivered.

## Route

`/admin/events/:eventId/dashboard`

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Table component — renders all log entries |
| `src/hooks/useGetTriggerLog.ts` | Query — `GET /events/:eventId/trigger-log` |
| `src/services/triggerLog.ts` | API call |
| `src/types/trigger-log.ts` | `TriggerLogEntry`, channel and status types |
| `api/events/[eventId]/trigger-log.ts` | Serverless function — returns fixture when `USE_MOCK_DATA=true` |
| `api/_fixtures/notifications.ts` | Mock data — `triggerLog` array |

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/events/:eventId/trigger-log` | List fired log entries for the event |

## Notes

- Channel badges: Slack (indigo), Email (blue), WhatsApp (green)
- Status badges: Delivered (green), Failed (red) — failed entries carry an `error` string shown as a tooltip
- Timestamps are formatted with `toLocaleString` — `Mar 9, 2026, 03:30 PM`
- The table is horizontally scrollable on small screens
- The dashboard page shell at `routes/.../dashboard.tsx` is a placeholder; future sections (RSVP stats, checklist completion per attendee) will be added as separate feature components alongside this one

# NotificationsPanel

Displays and edits all notification triggers configured for an event.

## What it does

Renders a list of trigger rows, each allowing the admin to configure timing, channel, and recipient, then save changes individually.

## Route

`/admin/events/:eventId/notifications`

## Key files

- `index.tsx` — panel shell, fetches triggers via `useGetTriggers`
- `TriggerRow.tsx` — individual trigger row with local state and save action

## Endpoints

- `GET /api/events/:eventId/triggers` — via `useGetTriggers`
- `PATCH /api/triggers/:triggerId` — via `useUpdateTrigger` (one mutation per row)

## Notes

- Timing value input only renders when timing is `days_before` or `hours_after`
- Each row manages its own local state — changes are not batched
- Source field is read-only; only timing/channel/recipient are editable

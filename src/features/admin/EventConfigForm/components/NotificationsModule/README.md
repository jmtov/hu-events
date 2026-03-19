# NotificationsModule

Inline trigger configuration panel rendered inside the EventConfigForm when the Notifications module is toggled on.

## What it does

Shows the 4 default notification triggers (2 checklist-sourced, 2 milestone) as editable rows. Changes are held in local draft state in the parent form and applied via PATCH after event creation.

## Route

n/a — sub-component of `EventConfigForm`, shown at `/admin/events/new`

## Key files

- `index.tsx` — rendered rows with controlled selects for timing/channel/recipient
- `constants.ts` — `DraftTrigger` type and `DEFAULT_DRAFT_TRIGGERS` array

## Endpoints

- None during rendering
- Parent (`EventConfigForm`) calls `GET /api/events/:eventId/triggers` then `PATCH /api/triggers/:triggerId` per trigger after event creation

## Notes

- No per-row Save button — all changes are committed on form submit
- Trigger config is matched to saved DB triggers by `name` field after creation
- If the PATCH step fails it is non-blocking; user can reconfigure on the notifications page

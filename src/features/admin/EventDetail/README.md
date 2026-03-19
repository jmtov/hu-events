# EventDetail

Post-save landing screen for admins. Shows event basics, active modules, and the key actions: edit, copy invite link, delete, and view dashboard.

## Route

`/admin/events/:eventId`

## Key files

- `index.tsx` — main component
- `components/EventBasicsCard.tsx` — title, description, date/time, event type
- `components/ModulesCard.tsx` — all modules with active/inactive indicator
- `components/DeleteConfirmDialog.tsx` — confirmation modal before deletion
- `src/hooks/useGetEvent.ts` — fetches event data
- `src/hooks/useDeleteEvent.ts` — delete mutation with cache invalidation
- `src/services/events.ts` — `getById`, `delete`

## Endpoints

- `GET /events/:eventId`
- `DELETE /events/:eventId`

## Status

- [x] Shows event basics: title, description, date/time, event type
- [x] Shows which modules are active with a visual indicator per module
- [x] "Edit event" button navigates to /admin/events/:eventId/edit
- [x] "Copy invite link" copies /join/:eventId to clipboard with copied feedback
- [x] "Delete event" triggers confirmation dialog
- [x] "View dashboard" button navigates to /admin/events/:eventId/dashboard
- [x] Saved banner displayed after create/edit redirect
- [x] i18n keys for en, es, pt-BR

## Notes

- The `showSavedBanner` prop is driven by the `?created=true` query param set by the create/edit form on redirect.
- Navigation after delete goes to `/admin/events` (event list).
- Copy invite link uses `window.location.origin` + `/join/:eventId`.

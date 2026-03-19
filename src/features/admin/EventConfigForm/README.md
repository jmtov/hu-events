# EventConfigForm

Single form used for creating and editing an event. Event basics at the top; below them, five toggleable module rows — each expands inline to show its config.

## Route

- `/admin/events/new` — create mode
- `/admin/events/:eventId/edit` — edit mode (not yet implemented)

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Main form component — state, handlers, layout |
| `constants.ts` | `eventConfigSchema` (Zod), `DEFAULT_MODULES` |
| `types.ts` | `EventConfigValues` (inferred from schema) |
| `components/ModuleToggleRow.tsx` | Expandable toggle row used by each module |
| `components/ChecklistModule/` | Checklist module — toggle content + standalone page |

## Endpoints

| Hook | Endpoint | Purpose |
|---|---|---|
| `useCreateEvent()` | `POST /events` | Create event with module state and `event_day_info` |
| `useGetEvent(eventId)` | `GET /events/:eventId` | Pre-populate form in edit mode |
| `useUpdateEvent(eventId)` | `PATCH /events/:eventId` | Save edits |
| `useDetectEventType()` | `POST /ai/detect-event-type` | AI type suggestion on description blur |
| `useSuggestModules()` | `POST /ai/suggest-modules` | AI module suggestions on description blur |
| `useGenerateChecklist()` | `POST /ai/generate-checklist` | AI checklist generation (via ChecklistModule) |

## Status

- [x] Create flow — basics, schedule, module toggles
- [x] Checklist module — draft items, AI generation, add/edit/delete
- [x] Module state included in create payload
- [x] AI event type detection on description blur
- [ ] `event_day_info` free-text field in basics (visible to attendees on event day only)
- [ ] Edit mode — pre-populate form from existing event (`useGetEvent` + `useUpdateEvent`)
- [ ] AI module suggestions (`useSuggestModules`)
- [ ] Participant list module inline config
- [ ] Budget module inline config
- [ ] Notifications module inline config
- [ ] Contacts module inline config

## Notes

- Modules are local state (`useState`) — not part of the Zod schema
- Checklist items drafted during creation are saved via `checklistService.addItem` after the event is created, before navigating — failures are non-blocking
- `ModuleToggleRow` unmounts children when disabled (CSS grid animation + delayed unmount)
- Invites to participants are triggered by the backend on save — the frontend does not call any invite endpoint; on subsequent saves only new participants receive an invite
- `event_day_info` is a plain text field (future: structured agenda builder); it must not be surfaced in the attendee view before the event day

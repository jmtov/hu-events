# ChecklistModule

Pre-event checklist module. Contains both the inline config shown inside the EventConfigForm toggle row and the standalone admin page for managing checklist items on an existing event.

## Route

- `n/a` — `index.tsx` is rendered as toggle row content inside EventConfigForm
- `/admin/events/:eventId/checklist` — `ChecklistPage.tsx` (standalone management page)

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Toggle row content — draft items, AI generation (create flow) |
| `ChecklistPage.tsx` | Standalone page for managing items on an existing event |
| `ChecklistItemForm.tsx` | Add / edit item form (shared by both) |
| `ChecklistItemRow.tsx` | Saved item row with inline edit (used in ChecklistPage) |
| `DraftItemRow.tsx` | Draft item row with edit/delete (used in index.tsx) |
| `constants.ts` | `checklistItemSchema`, `ChecklistItemValues` |

## Endpoints

| Hook | Endpoint | Purpose |
|---|---|---|
| `useGetChecklist(eventId)` | `GET /events/:eventId/checklist` | Load items (ChecklistPage) |
| `useAddChecklistItem(eventId)` | `POST /events/:eventId/checklist` | Add item (ChecklistPage) |
| `useUpdateChecklistItem(eventId)` | `PATCH /checklist/:itemId` | Edit item (ChecklistItemRow) |
| `useDeleteChecklistItem(eventId)` | `DELETE /checklist/:itemId` | Delete item (ChecklistItemRow) |
| `useGenerateChecklist()` | `POST /ai/generate-checklist` | AI suggestions (both) |

## Status

- [x] Inline draft builder in EventConfigForm (add, edit, delete, AI generation)
- [x] Standalone ChecklistPage (list, add, AI generation)
- [x] Inline edit per item (ChecklistItemRow)
- [x] Item types: checkbox, document_upload, info_input
- [x] Required toggle per item
- [ ] "Alert if incomplete" toggle per item (auto-creates notification trigger)

## Notes

- `DraftItemRow` is only used during event creation (items are not yet persisted)
- `ChecklistItemRow` is only used in `ChecklistPage` (items are already persisted with an `id`)
- `index.tsx` receives all state and handlers as props from `EventConfigForm` — it owns no state itself

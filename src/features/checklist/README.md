# Pre-event checklist (F-05)

Lets the admin define a list of tasks and documents attendees must complete before the event.

## Route

`/admin/events/:eventId/checklist`

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Page shell — orchestrates list, add form, and AI generation |
| `ChecklistItemRow.tsx` | Single item row with inline edit and delete |
| `ChecklistItemForm.tsx` | Shared add/edit form (name, type, required) |
| `constants.ts` | Zod schema + inferred form type |
| `src/hooks/useGetChecklist.ts` | Query — `GET /events/:eventId/checklist` |
| `src/hooks/useAddChecklistItem.ts` | Mutation — `POST /events/:eventId/checklist` |
| `src/hooks/useUpdateChecklistItem.ts` | Mutation — `PATCH /checklist/:itemId` |
| `src/hooks/useDeleteChecklistItem.ts` | Mutation — `DELETE /checklist/:itemId` |
| `src/hooks/useGenerateChecklist.ts` | Mutation — `POST /ai/generate-checklist` |
| `src/services/checklist.ts` | API calls for CRUD operations |
| `src/types/checklist.ts` | `ChecklistItem`, `ChecklistItemType`, shared labels, colors, `normaliseChecklistType` |

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/events/:eventId/checklist` | List items |
| POST | `/api/events/:eventId/checklist` | Create item |
| PATCH | `/api/checklist/:itemId` | Update item |
| DELETE | `/api/checklist/:itemId` | Delete item |
| POST | `/api/ai/generate-checklist` | AI suggestion (existing endpoint) |

## Notes

- Item types: `checkbox` | `document_upload` | `info_input`
- The AI endpoint returns `'task'` for checkbox items — `normaliseChecklistType()` in `src/types/checklist.ts` maps it to `'checkbox'`
- AI generation requires the event to have a `description` — the button is disabled when it is absent
- The "Generate with AI" flow adds all suggested items directly to the list via sequential `POST` calls; the admin can then edit or remove them
- The API functions under `api/` are structurally complete but use stub responses pending database integration

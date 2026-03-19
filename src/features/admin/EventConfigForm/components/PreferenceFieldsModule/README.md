# PreferenceFieldsModule

## What it does
Inline module inside the "Participant List" toggle row of EventConfigForm. Admin defines custom preference fields that attendees will fill during onboarding. Fields are managed as local draft state during event creation and persisted via API after the event is saved.

## Route
`n/a` — sub-component of EventConfigForm (`/admin/events/new`)

## Key files
- `index.tsx` — module container, receives draft state and handlers from EventConfigForm
- `PreferenceFieldForm.tsx` — form for adding/editing a single field (label, field_type, options, required)
- `PreferenceFieldRow.tsx` — read-only row with edit/delete actions; exports `DraftField` type
- `constants.ts` — Zod schema (`preferenceFieldSchema`), type labels, badge colours

## Endpoints
Called from `EventConfigForm` after event creation (not directly from this module):
- `POST /events/:eventId/preference-fields` — via `preferenceFieldsService.add`

CRUD hooks for future edit-mode integration:
- `useAddPreferenceField(eventId)`
- `useUpdatePreferenceField(eventId)`
- `useDeletePreferenceField(eventId)`

## Status
- [x] Draft-based add / edit / delete in local state
- [x] Conditional `options` field when `field_type === 'select'`
- [x] `required` toggle
- [x] Integrated in `participantList` module toggle row
- [ ] Persist fields via API on event save (F-04 — wired in EventConfigForm submit)
- [ ] AI "Suggest fields" button (Subtarefa 3)
- [ ] Edit-mode: load existing fields from `useGetPreferenceFields`

## Notes
- `options_raw` is a comma-separated string in the form; split to `string[]` before API call
- Draft fields use a `_key` (timestamp + random) for React list identity — not a DB id

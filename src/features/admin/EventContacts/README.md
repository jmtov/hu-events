# EventContacts

Admin screen for managing event contact persons. Contacts are visible to attendees so they know who to reach out to for questions or issues.

## Route

`/admin/events/:eventId/contacts`

## Key files

- `index.tsx` — main component; lists contacts, handles add/update/delete
- `components/ContactCard.tsx` — displays one contact with inline edit form toggle
- `components/ContactForm.tsx` — add/edit form (name, role, email, phone)
- `constants.ts` — Zod schema (`contactSchema`) and `ContactFormValues` type

## Hooks

- `useGetContacts(eventId)` — query
- `useAddContact(eventId)` — mutation
- `useUpdateContact(eventId)` — mutation
- `useDeleteContact(eventId)` — mutation

## Endpoints

- `GET /events/:eventId/contacts`
- `POST /events/:eventId/contacts`
- `PATCH /contacts/:contactId`
- `DELETE /contacts/:contactId`

## API files

- `api/events/[eventId]/contacts.ts` — GET list + POST create (mock-data aware)
- `api/contacts/[contactId].ts` — PATCH update + DELETE remove

## Status

- [x] List contacts for an event
- [x] Add new contact (inline form)
- [x] Edit contact (inline form per card)
- [x] Delete contact
- [x] Empty state
- [x] Loading and error states
- [x] i18n — en, es, pt-BR

## Notes

- Phone field is optional; shown with a phone icon only when present.
- Edit is inline per card (no separate page or modal).
- Mock data returns fixture contacts for `event_id = a1b2c3d4-0001-0000-0000-000000000001`.

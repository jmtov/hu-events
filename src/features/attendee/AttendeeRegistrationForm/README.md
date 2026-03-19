# AttendeeRegistrationForm

Form for attendees to update their profile (name, email, dietary restrictions).

## Route

Not mounted on a standalone route — used as an embedded component wherever profile editing is needed.

## Key files

| File | Purpose |
|---|---|
| `index.tsx` | Form component — fields, submit handler, success state |
| `types.ts` | `AttendeeRegistrationValues` (inferred from schema) |
| `constants.ts` | Zod validation schema |

## Endpoints

| Hook | Endpoint | Purpose |
|---|---|---|
| `useUpdateMyProfile(participantId)` | `PATCH /participants/:id` | Updates participant profile |

## Notes

- Receives `participantId` and `onSuccess` as props.
- `dietary` is a free-text field for dietary restrictions — it is a pre-existing field from the initial form and may be superseded by the dynamic preference fields system (F-04).

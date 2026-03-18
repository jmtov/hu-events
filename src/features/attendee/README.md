# Feature: Attendee Registration (F-10)

Attendee onboarding form. Attendee lands here via invite link, signs in with Google (auto-fills name and email), completes remaining required fields, and confirms RSVP.

## Route

`/join/:eventId`

## Key files

| File | Role |
|---|---|
| `src/features/attendee/AttendeeRegistration.tsx` | Main component |
| `src/schemas/attendee.ts` | Zod validation schema |
| `src/hooks/useUpdateMyProfile.ts` | Mutation — PATCH /participants/:participantId |
| `src/lib/api.ts` | Shared axios client |

## Endpoints

| Method | Path | Description |
|---|---|---|
| `PATCH` | `/api/participants/:participantId` | Save completed profile fields |

## Notes

- `participantId` and `onSuccess` are received as props — the parent route is responsible for providing them
- `dietary` is an example of a dynamic preference field; in the full implementation these fields are driven by the event config (F-04)
- Google Sign-In (F-10) auto-fills `fullName` and `email` before this form renders — those fields should be pre-populated
- On success, parent should navigate to the attendee event view (`/attendee/events/:eventId`)

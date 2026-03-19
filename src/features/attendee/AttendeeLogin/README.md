# AttendeeLogin

Email prompt that identifies the attendee before showing their event list.

## Route

`/attendee/login`

## Key files

- `index.tsx` — form component (React Hook Form + Zod, no mutation needed)
- `constants.ts` — `loginSchema` (email only)
- i18n: `public/locales/*/attendee.json` → `login.*`

## Endpoints

None — no API call. On submit, stores email in `sessionStorage('humand_attendee_email')` and navigates to `/attendee/events`.

## Status

- [x] Email form with validation
- [x] sessionStorage persistence
- [x] Redirect to event list on submit
- [ ] Magic link auth (future — replace sessionStorage with a real token)

## Notes

No password or OTP in MVP. The email is used as a bare identifier to look up participant records.

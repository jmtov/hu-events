# Event OS — Screen Map

## Overview

The app has two distinct contexts: **Admin** and **Attendee**. A person can have both roles under the same email. When that's the case, a role switcher appears in the header to navigate directly between contexts.

Total screens: **14**

---

## Public screens (no auth required)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| 1 | Admin login | `/login` | Google OAuth 2.0 sign-in for admins |
| 2 | Attendee login | `/attendee/login` | Magic link sign-in for attendees |
| 3 | Attendee onboarding | `/join/:eventId` | First-time profile completion after receiving an invite link. Google Sign-In auto-fills name, last name, and email. Redirects to attendee event view on completion. |
| 4 | Event not found | `/join/:eventId` (fallback) | Shown when an attendee tries to access a deleted event via direct link |

---

## Admin screens (requires admin auth)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| 5 | Admin event list | `/admin/events` | All events created by the admin, ordered by date ascending. Entry point after login. |
| 6 | Create event | `/admin/events/new` | Full event creation form: event basics + five toggleable module sections. On save, redirects to event detail. |
| 7 | Event detail & dashboard | `/admin/events/:eventId` | Event info, active modules, live RSVP count, checklist completion per attendee, and trigger activity log. Key actions: Edit, Copy invite link, Delete. Only visible to the admin who created the event. |
| 8 | Edit event | `/admin/events/:eventId/edit` | Same form as creation, pre-populated with existing data. On save, redirects back to event detail. |

---

## Attendee screens (requires attendee auth)

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| 10 | Attendee event list | `/attendee/events` | All events the attendee has been invited to, ordered by date ascending. Entry point after login. Shows checklist completion % per event. |
| 11 | Attendee event view | `/attendee/events/:eventId` | Single scrollable page with four sections: event info, budget allocation (if enabled), personal checklist, and contact persons. On the day of the event, a "Today" section appears at the top with the admin's event day info. |

---

## Module sections (within the event form — not standalone screens)

These are not separate screens but collapsible sections within the Create event and Edit event forms:

| Module | Lives inside |
|--------|-------------|
| Participant list | Create event / Edit event |
| Attendee preference fields | Create event / Edit event (within participant list section) |
| Pre-event checklist | Create event / Edit event |
| Travel & cost estimation | Create event / Edit event |
| Automated notifications | Create event / Edit event |
| Event contact info | Create event / Edit event |

---

## Navigation flows

### Admin flow
```
/login
  └── /admin/events
        ├── /admin/events/new
        │     └── /admin/events/:eventId      (on save)
        │           └── /admin/events/:eventId/edit
        │                 └── /admin/events/:eventId  (on save)
        └── /admin/events/:eventId            (on click existing event)
```

### Attendee flow
```
/attendee/login  ──or──  /join/:eventId
  └── /attendee/events
        └── /attendee/events/:eventId
```

### Role switcher
```
/admin/events  ←──────────────────→  /attendee/events
              (switcher in header,
               only when both roles)
```

---

## Notes

- Sessions are persistent — token stored in localStorage with 30-day expiration
- The event form uses localStorage as a safety net for unsaved changes between sessions — cleared on successful save
- All events are live immediately after saving — no publish step
- The "Event not found" screen (#4) uses the same route as onboarding — it's a fallback state, not a separate route
- ⚠️ TODO: receipt upload screen — currently defined as part of the attendee event view but may evolve into its own section or screen

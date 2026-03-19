# Event OS — Feature List

## Admin / Organizer

### Auth
- Admins sign in with Google OAuth 2.0 — no email/password fallback
- Attendees sign in via magic link — enter email, receive link, click to authenticate
- A person can have both roles (admin and attendee) under the same email
- When a person has both roles, a switcher appears in the app header — clicking it navigates directly to the other context's event list (`/admin/events` or `/attendee/events`)
- The switcher only appears when the backend confirms the person has both roles
- Sessions are persistent — token stored in localStorage with a 30-day expiration
- Admin role is defined in the users database and verified via an API endpoint

### Event list
- View all events created by the admin
- See event name, date, status, and RSVP count at a glance
- Navigate to create a new event or enter an existing one to edit it
- Delete an event — requires explicit confirmation before proceeding; deletion is permanent and removes all associated data (participants, checklist, budget, triggers)

### Event creation & editing
- All configuration lives in a single form, used for both creating and editing an event
- Event basics at the top: title, description, date/time, event type
- One free-text field for event day info (agenda, what's happening) — visible to attendees only on the day of the event
- ⚠️ TODO: evolve event day info into a structured agenda builder in a future iteration
- Five toggleable modules below the basics, each as an independent collapsible section:
  - **Participant list** — add attendees, configure preference fields
  - **Pre-event checklist** — build the checklist, set item types and alert toggles
  - **Travel & cost estimation** — enable categories, AI estimates, set caps
  - **Automated notifications** — configure triggers, channels, recipients
  - **Event contact info** — define contact persons visible to attendees
- AI auto-detects event type from description (HR retreat, BDR call, Hackathon, Workshop, Other)
- AI auto-suggests which modules to enable based on the event description
- Admin can return to this form at any time to edit any module
- Enabling a module expands its config; disabling it hides it completely

### Event deletion
- Admin can delete an event from the event list
- Deletion requires an explicit confirmation step — the action is permanent and irreversible
- Deleting an event removes all associated data: participants, checklist items, budget config, notification triggers, and contact info

### Module: Participant list
- Add attendees by email — invites are sent automatically when the event is saved
- On subsequent saves, invites are sent only to newly added attendees — not to those who already received one
- Attendees self-complete their profile via Google Sign-In after receiving the invite
- Admin can also add/edit attendee data manually as fallback
- Enable/disable optional fields (role, team)
- Create custom attendee preference fields (e.g. dietary restrictions, prefers technical jargon)
- AI suggests preference fields based on event description
- AI flags document requirements per attendee location (e.g. passport required for Spain)

### Module: Pre-event checklist
- Add / edit / remove checklist items
- Set item type: checkbox task / document upload / info input
- Mark items as required or optional
- Toggle "alert if incomplete" per item (auto-creates a notification trigger)
- AI generates a suggested checklist from the event description
- The same checklist applies to all attendees — no per-person customization in MVP
- New attendees added after the first save receive the checklist as it stands at that moment
- ⚠️ TODO: define behavior when admin edits checklist items after attendees have already recorded progress

### Module: Travel & cost estimation
- Enable/disable cost categories individually (flights, accommodation, food, comms, misc, custom)
- AI estimates cost per person based on attendee locations and event dates
- Set a max allocation cap per category
- View running total max cost per person
- Attendees can see their budget allocation per category in their event view

### Module: Automated notifications
- View all triggers — sourced automatically from checklist items with "alert if incomplete" enabled, plus two fixed milestones: RSVP hits 50% and event ended
- All triggers are configurable: when to send (immediately / X days before / X hours after), channel (Slack / Email / WhatsApp), recipient (attendee / HR admin / both)
- Fixed milestone triggers come with sensible defaults pre-loaded: RSVP 50% → Slack → HR admin; Event ended → Email → all attendees
- The condition of milestone triggers is fixed (50% and event end date) — only timing, channel, and recipient are editable
- Changes to a trigger's config apply only to future sends — what's already been sent is not affected

### Event contact info
- Define one or more contact persons for the event (name, role, email, WhatsApp/phone)
- Visible to attendees if they have questions or issues

### Dashboard
- Separate screen accessible from the event detail screen
- Only visible to the admin who created the event
- View event overview: RSVP count vs total expected attendees
- See checklist completion per attendee per item
- View trigger activity log: what fired, when, through which channel, and to whom
- Data refetches automatically on a short interval to reflect live changes

---

## Attendee / Participant

### Auth
- Sign in with email only (no password) — attendees access the platform via their invite link or a magic link sent to their email

### Event list
- After signing in, attendee sees all events they have been invited to
- Each event shows name, date, and overall checklist completion status
- Clicking an event navigates to the attendee event detail view

### Pre-event
- Receive notification (Email / WhatsApp / Slack) with event info and requirements
- Sign in with Google to auto-fill name, last name, and email
- Complete profile with remaining required fields (location, preferences, etc.)
- View event details (title, description, date, location)
- View contact person(s) for questions or issues
- View personal checklist and completion status — no visibility into other attendees' progress
- Complete checklist items:
  - Confirm RSVP
  - Upload documents (passport, national ID, etc.) — replaceable at any time
  - Submit info inputs (dietary restrictions, preferences, etc.) — editable at any time
  - Check off tasks — reversible at any time

### During the event
- View what's happening that day (agenda / event day info)
- Upload receipts (expenses covered by the company)

### Post-event
- Receive post-event survey link via email (auto-triggered when event ends)

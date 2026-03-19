# Event OS — Feature List

## Admin / Organizer

### Auth
- Sign in with Google (OAuth 2.0) — admins only
- On login, redirect to the event list

### Event list
- View all events created by the admin
- See event name, date, status, and RSVP count at a glance
- Navigate to create a new event or enter an existing one to edit it

### Event creation & editing
- All configuration lives in a single form, used for both creating and editing an event
- Event basics at the top: title, description, date/time, event type
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

### Module: Participant list
- Add attendees by email — they self-complete their profile via Google Sign-In
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

### Module: Travel & cost estimation
- Enable/disable cost categories individually (flights, accommodation, food, comms, misc, custom)
- AI estimates cost per person based on attendee locations and event dates
- Set a max allocation cap per category
- View running total max cost per person

### Module: Automated notifications
- View all triggers (sourced from checklist items + fixed milestones)
- Configure each trigger: when to send (immediately / X days before / X hours after), channel (Slack / Email / WhatsApp), recipient (attendee / HR admin / both)
- Fixed milestone triggers: RSVP hits 50%, event ended

### Event contact info
- Define one or more contact persons for the event (name, role, email, WhatsApp/phone)
- Visible to attendees if they have questions or issues

### Dashboard
- View event overview (RSVP count, checklist completion per attendee)
- See which attendees have completed / not completed each checklist item
- View trigger activity log (what fired, when, to whom)

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
- View personal checklist and completion status
- Complete checklist items:
  - Confirm RSVP
  - Upload documents (passport, national ID, etc.)
  - Submit info inputs (dietary restrictions, preferences, etc.)
  - Check off tasks

### During the event
- View event info (directions, agenda)
- Upload receipts (expenses covered by the company)

### Post-event
- Receive post-event survey link via email (auto-triggered when event ends)

export type EventModules = {
  participantList: boolean;
  checklist: boolean;
  budget: boolean;
  notifications: boolean;
  contacts: boolean;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  date_start: string;
  date_end: string | null;
  location: string | null;
  expected_attendees: number | null;
  event_day_info: string | null;
  modules: EventModules;
  created_at: string;
  updated_at: string;
};

export type ChecklistItemPayload = {
  label: string;
  item_type: 'checkbox' | 'document_upload' | 'info_input';
  required: boolean;
  alert_if_incomplete: boolean;
};

export type PreferenceFieldPayload = {
  label: string;
  field_type: 'text' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
};

export type TriggerPayload = {
  name: string;
  source: 'milestone' | 'checklist';
  timing: 'immediately' | 'days_before' | 'hours_after';
  timingValue: number;
  channel: 'slack' | 'email' | 'whatsapp';
  recipient: 'attendee' | 'hr_admin' | 'both';
};

export type CreateEventPayload = {
  title: string;
  description: string;
  event_type: string;
  date_start: string;
  date_end?: string;
  location?: string;
  expected_attendees?: number;
  event_day_info?: string;
  modules?: Partial<EventModules>;
  participants?: Array<{ email: string }>;
  checklist?: ChecklistItemPayload[];
  preferenceFields?: PreferenceFieldPayload[];
  triggers?: TriggerPayload[];
};

export type AdminEventSummary = Event & { rsvp_count: number };

export type ChecklistEntry = {
  id: string;
  event_id: string;
  label: string;
  item_type: 'checkbox' | 'document_upload' | 'info_input';
  required: boolean;
  alert_if_incomplete: boolean;
  sort_order: number;
};

export type EventDetail = Event & {
  participants: import('./participant').Participant[];
  checklist: ChecklistEntry[];
  triggers: import('./trigger').Trigger[];
  budget: import('./budget').Budget | null;
};

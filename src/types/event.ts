export const EVENT_TYPES = [
  'hr_retreat',
  'bdr_call',
  'hackathon',
  'workshop',
  'other',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

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
  event_type: EventType;
  date_start: string;
  date_end: string | null;
  location: string | null;
  modules: EventModules;
  created_at: string;
  updated_at: string;
};

export type CreateEventPayload = Pick<
  Event,
  'title' | 'description' | 'event_type' | 'date_start'
> & {
  date_end?: string;
  location?: string;
};

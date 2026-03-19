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
  modules?: Partial<EventModules>;
};

export type AdminEventSummary = Event & { rsvp_count: number };

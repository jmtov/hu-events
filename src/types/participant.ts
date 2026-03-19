export const RSVP_STATUSES = ['pending', 'confirmed', 'declined'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const PREFERENCE_FIELD_TYPES = ['text', 'select', 'boolean'] as const;
export type PreferenceFieldType = (typeof PREFERENCE_FIELD_TYPES)[number];

export type PreferenceField = {
  id: string;
  event_id: string;
  label: string;
  field_type: PreferenceFieldType;
  options: string[] | null;
  required: boolean;
  sort_order: number;
};

export type Participant = {
  id: string;
  event_id: string;
  email: string;
  full_name: string;
  google_uid: string | null;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  rsvp_status: RsvpStatus;
  created_at: string;
  updated_at: string;
};

export type UpdateParticipantPayload = Partial<
  Pick<
    Participant,
    | 'full_name'
    | 'location_city'
    | 'location_region'
    | 'location_country'
    | 'rsvp_status'
  >
>;

// AI-suggested preference fields (F-04) — inputType includes 'number' which the AI
// may suggest but is not yet a stored PreferenceFieldType.
export const SUGGESTION_FIELD_TYPES = [
  'text',
  'select',
  'boolean',
  'number',
] as const;
export type SuggestionFieldType = (typeof SUGGESTION_FIELD_TYPES)[number];

export type PreferenceFieldSuggestion = {
  label: string;
  inputType: SuggestionFieldType;
  options: string[] | null;
};

export type PreferenceFieldSuggestionResult = {
  fields: PreferenceFieldSuggestion[];
};

/** Maps AI suggestion inputType to a stored PreferenceFieldType. 'number' falls back to 'text'. */
export function normaliseSuggestionType(inputType: SuggestionFieldType): PreferenceFieldType {
  if (inputType === 'text' || inputType === 'select' || inputType === 'boolean') return inputType;
  return 'text';
}

/** Single checklist task from Claude. */
export type ChecklistItemType = 'task' | 'document_upload' | 'info_input';

export type ChecklistItem = {
  name: string;
  type: ChecklistItemType;
  suggestedRequired: boolean;
};

export type ChecklistResult = {
  items: ChecklistItem[];
};

/** Corporate event classification from Claude. */
export type EventLocationType = 'Presencial' | 'Remoto' | 'Híbrido';

export type ClassifiedEvent = {
  suggested_title: string;
  event_type: string;
  location_type: string;
  is_travel_required: boolean;
};

/** Dynamic form field suggestion from Claude. */
export type FormFieldInputType = 'text' | 'select' | 'boolean' | 'number';

export type FormFieldSuggestion = {
  label: string;
  inputType: FormFieldInputType;
  options: string[] | null;
};

export type FormBuilderResult = {
  fields: FormFieldSuggestion[];
};

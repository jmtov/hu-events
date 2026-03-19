export const CHECKLIST_ITEM_TYPES = [
  'checkbox',
  'document_upload',
  'info_input',
] as const;
export type ChecklistItemType = (typeof CHECKLIST_ITEM_TYPES)[number];

export const CHECKLIST_TYPE_LABELS: Record<ChecklistItemType, string> = {
  checkbox: 'Checkbox item',
  document_upload: 'Document upload',
  info_input: 'Text response',
};

export const CHECKLIST_TYPE_COLORS: Record<ChecklistItemType, string> = {
  checkbox:
    'bg-blue-50 text-blue-700 ring-blue-700/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20',
  document_upload:
    'bg-orange-50 text-orange-700 ring-orange-700/20 dark:bg-orange-400/10 dark:text-orange-400 dark:ring-orange-400/20',
  info_input:
    'bg-purple-50 text-purple-700 ring-purple-700/20 dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/20',
};

/** Maps AI-returned type strings to valid ChecklistItemType values. */
export const normaliseChecklistType = (raw: string): ChecklistItemType => {
  if (raw === 'document_upload' || raw === 'info_input') return raw;
  return 'checkbox';
};

export type ChecklistItem = {
  id: string;
  eventId: string;
  name: string;
  type: ChecklistItemType;
  required: boolean;
};

export type CreateChecklistItemPayload = Omit<ChecklistItem, 'id' | 'eventId'>;
export type UpdateChecklistItemPayload = Partial<CreateChecklistItemPayload>;

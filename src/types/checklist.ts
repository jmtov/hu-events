export const CHECKLIST_ITEM_TYPES = [
  'checkbox',
  'document_upload',
  'info_input',
] as const;
export type ChecklistItemType = (typeof CHECKLIST_ITEM_TYPES)[number];

export type ChecklistItem = {
  id: string;
  eventId: string;
  name: string;
  type: ChecklistItemType;
  required: boolean;
};

export type CreateChecklistItemPayload = Omit<ChecklistItem, 'id' | 'eventId'>;
export type UpdateChecklistItemPayload = Partial<CreateChecklistItemPayload>;

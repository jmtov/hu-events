export type ChecklistItemType = 'checkbox' | 'document_upload' | 'info_input';

export type ChecklistItem = {
  id: string;
  eventId: string;
  name: string;
  type: ChecklistItemType;
  required: boolean;
  alertIfIncomplete: boolean;
};

export type CreateChecklistItemPayload = Omit<ChecklistItem, 'id' | 'eventId'>;
export type UpdateChecklistItemPayload = Partial<CreateChecklistItemPayload>;

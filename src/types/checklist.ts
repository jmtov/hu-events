export const CHECKLIST_ITEM_TYPES = [
  'task',
  'document_upload',
  'info_input',
] as const;
export type ChecklistItemType = (typeof CHECKLIST_ITEM_TYPES)[number];

export type ChecklistItem = {
  name: string;
  type: ChecklistItemType;
  suggestedRequired: boolean;
};

export type ChecklistResult = { items: ChecklistItem[] };

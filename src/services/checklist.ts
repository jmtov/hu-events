import { api } from '@/lib/api';
import type {
  ChecklistItem,
  CreateChecklistItemPayload,
  UpdateChecklistItemPayload,
} from '@/types/checklist';

export const checklistService = {
  getByEvent: (eventId: string): Promise<ChecklistItem[]> =>
    api
      .get<ChecklistItem[]>(`/events/${eventId}/checklist`)
      .then((r) => r.data),

  addItem: (
    eventId: string,
    payload: CreateChecklistItemPayload,
  ): Promise<ChecklistItem> =>
    api
      .post<ChecklistItem>(`/events/${eventId}/checklist`, payload)
      .then((r) => r.data),

  updateItem: (
    itemId: string,
    payload: UpdateChecklistItemPayload,
  ): Promise<ChecklistItem> =>
    api
      .patch<ChecklistItem>(`/checklist/${itemId}`, payload)
      .then((r) => r.data),

  deleteItem: (itemId: string): Promise<void> =>
    api.delete(`/checklist/${itemId}`).then((r) => r.data),
};

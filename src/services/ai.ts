import { api } from '@/lib/api';
import type { ChecklistResult } from '@/types/checklist';
import type { SuggestEventPayload, EventSuggestion } from '@/types/event-suggestion';

export type DetectEventTypeResult = { event_type: string };

export const aiService = {
  detectEventType: (description: string): Promise<DetectEventTypeResult> =>
    api
      .post<DetectEventTypeResult>('/ai/detect-event-type', { description })
      .then((r) => r.data),

  generateChecklist: (params: {
    description: string;
    eventType?: string;
  }): Promise<ChecklistResult> =>
    api
      .post<ChecklistResult>('/ai/generate-checklist', params)
      .then((r) => r.data),

  suggestEvent: (payload: SuggestEventPayload): Promise<EventSuggestion> =>
    api
      .post<EventSuggestion>('/ai/suggest-event', payload)
      .then((r) => r.data),
};

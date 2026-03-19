import { api } from '@/lib/api';
import type { ChecklistResult } from '@/types/checklist';
import type { EventType } from '@/types/event';
import type { PreferenceFieldSuggestionResult } from '@/types/participant';

export type DetectEventTypeResult = { event_type: EventType };

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

  suggestPreferenceFields: (params: {
    description: string;
    eventType?: string;
  }): Promise<PreferenceFieldSuggestionResult> =>
    api
      .post<PreferenceFieldSuggestionResult>(
        '/ai/suggest-preference-fields',
        params,
      )
      .then((r) => r.data),
};

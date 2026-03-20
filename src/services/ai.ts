import { api } from '@/lib/api';
import type { ChecklistResult } from '@/types/checklist';

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
};

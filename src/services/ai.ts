import { api } from '@/lib/api';
import type {
  ChecklistResult,
  ClassifiedEvent,
  FormBuilderResult,
} from '@/types/humand-events';

export const aiService = {
  detectEventType: (description: string): Promise<ClassifiedEvent> =>
    api
      .post<ClassifiedEvent>('/ai/detect-event-type', { description })
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
  }): Promise<FormBuilderResult> =>
    api
      .post<FormBuilderResult>('/ai/suggest-preference-fields', params)
      .then((r) => r.data),
};

import { api } from '@/lib/api';
import type { SuggestEventPayload, EventSuggestion } from '@/types/event-suggestion';

export const aiService = {
  suggestEvent: (payload: SuggestEventPayload): Promise<EventSuggestion> =>
    api
      .post<EventSuggestion>('/ai/suggest-event', payload)
      .then((r) => r.data),
};

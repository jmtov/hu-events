import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai';
import type { SuggestEventPayload } from '@/types/event-suggestion';

export const useSuggestEvent = () =>
  useMutation({
    mutationFn: (payload: SuggestEventPayload) => aiService.suggestEvent(payload),
  });

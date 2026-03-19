import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai';

export const useSuggestPreferenceFields = () =>
  useMutation({
    mutationFn: (params: { description: string; eventType?: string }) =>
      aiService.suggestPreferenceFields(params),
  });

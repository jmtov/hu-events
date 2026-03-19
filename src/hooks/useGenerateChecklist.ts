import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai';

export const useGenerateChecklist = () =>
  useMutation({
    mutationFn: (params: { description: string; eventType?: string }) =>
      aiService.generateChecklist(params),
  });

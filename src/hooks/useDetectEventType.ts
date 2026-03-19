import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai';

export const useDetectEventType = () =>
  useMutation({
    mutationFn: (description: string) => aiService.detectEventType(description),
  });

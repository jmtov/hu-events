import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  preferenceFieldsService,
  type CreatePreferenceFieldPayload,
} from '@/services/preferenceFields';

export const useAddPreferenceField = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePreferenceFieldPayload) =>
      preferenceFieldsService.add(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'preference-fields'] });
    },
  });
};

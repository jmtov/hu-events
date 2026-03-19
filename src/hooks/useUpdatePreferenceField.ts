import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  preferenceFieldsService,
  type UpdatePreferenceFieldPayload,
} from '@/services/preferenceFields';

export const useUpdatePreferenceField = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fieldId, payload }: { fieldId: string; payload: UpdatePreferenceFieldPayload }) =>
      preferenceFieldsService.update(fieldId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'preference-fields'] });
    },
  });
};

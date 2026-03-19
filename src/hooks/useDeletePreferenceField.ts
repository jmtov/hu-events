import { useMutation, useQueryClient } from '@tanstack/react-query';
import { preferenceFieldsService } from '@/services/preferenceFields';

export const useDeletePreferenceField = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) => preferenceFieldsService.remove(fieldId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'preference-fields'] });
    },
  });
};

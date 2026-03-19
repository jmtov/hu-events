import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contacts';
import type { CreateContactPayload } from '@/types/contact';

export const useAddContact = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateContactPayload) =>
      contactService.create(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'contacts'] });
    },
  });
};

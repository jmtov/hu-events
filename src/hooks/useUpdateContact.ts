import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contacts';
import type { UpdateContactPayload } from '@/types/contact';

export const useUpdateContact = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contactId,
      payload,
    }: {
      contactId: string;
      payload: UpdateContactPayload;
    }) => contactService.update(contactId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'contacts'] });
    },
  });
};

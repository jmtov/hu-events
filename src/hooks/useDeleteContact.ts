import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contacts';

export const useDeleteContact = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => contactService.delete(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'contacts'] });
    },
  });
};

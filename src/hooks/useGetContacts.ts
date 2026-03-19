import { useQuery } from '@tanstack/react-query';
import { contactService } from '@/services/contacts';

export const useGetContacts = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId, 'contacts'],
    queryFn: () => contactService.getByEvent(eventId),
    enabled: !!eventId,
  });

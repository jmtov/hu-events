import { useQuery } from '@tanstack/react-query';
import { contactService } from '@/services/contacts';

export const useGetContacts = (eventId: string) =>
  useQuery({
    queryKey: ['contacts', eventId],
    queryFn: () => contactService.getByEvent(eventId),
    enabled: !!eventId,
  });

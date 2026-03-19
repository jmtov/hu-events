import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/events';

export const useGetAdminEvents = () =>
  useQuery({
    queryKey: ['admin', 'events'],
    queryFn: () => eventService.getAdminEvents(),
  });

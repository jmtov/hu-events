import { useQuery } from '@tanstack/react-query';
import { budgetService } from '@/services/budget';

export const useGetBudget = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId, 'budget'],
    queryFn: () => budgetService.getBudget(eventId),
    enabled: !!eventId,
  });

import { useQuery } from '@tanstack/react-query';
import { checklistService } from '@/services/checklist';
import type { ChecklistItem } from '@/types/checklist';

export const useGetChecklist = (eventId: string) =>
  useQuery({
    queryKey: ['checklist', eventId],
    queryFn: () => checklistService.getByEvent(eventId),
    select: (data): ChecklistItem[] => (Array.isArray(data) ? data : []),
  });

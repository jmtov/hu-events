import { useGetEvent } from './useGetEvent';

export const useGetBudget = (eventId: string) => {
  const query = useGetEvent(eventId);
  return { ...query, data: query.data?.budget ?? null };
};

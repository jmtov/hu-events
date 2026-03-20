import { useGetEvent } from './useGetEvent';

export const useGetContacts = (eventId: string) => {
  const query = useGetEvent(eventId);
  return {
    ...query,
    data: query.data?.contacts,
  };
};

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

type CurrentUser = {
  email: string;
  name: string;
  picture: string;
};

export const useGetCurrentUser = () =>
  useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<CurrentUser | null> => {
      try {
        const res = await api.get<CurrentUser>('/auth/me');
        return res.data;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { participantService } from '@/services/participants';

export const useAddParticipant = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => participantService.add(eventId, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] });
    },
  });
};

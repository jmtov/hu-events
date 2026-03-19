import { useMutation, useQueryClient } from '@tanstack/react-query';
import { participantService } from '@/services/participants';

type RemoveParticipantVars = {
  participantId: string;
  eventId: string;
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participantId }: RemoveParticipantVars) =>
      participantService.remove(participantId),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] });
    },
  });
};

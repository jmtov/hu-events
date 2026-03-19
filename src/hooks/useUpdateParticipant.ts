import { useMutation, useQueryClient } from '@tanstack/react-query';
import { participantService } from '@/services/participants';
import type { UpdateParticipantPayload } from '@/types/participant';

type UpdateParticipantVars = {
  participantId: string;
  eventId: string;
  payload: UpdateParticipantPayload;
};

export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participantId, payload }: UpdateParticipantVars) =>
      participantService.update(participantId, payload),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['participants', eventId] });
    },
  });
};

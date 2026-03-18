import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AttendeeRegistrationValues } from '@/schemas/attendee';

export const useUpdateMyProfile = (participantId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AttendeeRegistrationValues) =>
      api.patch(`/participants/${participantId}`, values).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['participants', participantId],
      });
    },
  });
};

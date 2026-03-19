import { useQuery } from '@tanstack/react-query'
import { participantService } from '@/services/participants'
import type { Participant } from '@/types/participant'

export const useGetParticipants = (eventId: string) =>
  useQuery({
    queryKey: ['participants', eventId],
    queryFn: () => participantService.getByEvent(eventId),
    select: (data): Participant[] => (Array.isArray(data) ? data : []),
    enabled: !!eventId,
  })

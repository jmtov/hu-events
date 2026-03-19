import { useQuery } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance'

export const useGetParticipantData = (eventId: string, email: string | null) =>
  useQuery({
    queryKey: ['participant', eventId, email],
    queryFn: () => attendanceService.getParticipantData(eventId, email!),
    enabled: !!eventId && !!email,
  })

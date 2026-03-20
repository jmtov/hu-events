import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { attendanceService } from '@/services/attendance'

export const useGetParticipantData = (eventId: string, email: string | null) =>
  useQuery({
    queryKey: ['participant', eventId, email],
    queryFn: async () => {
      try {
        return await attendanceService.getParticipantData(eventId, email!)
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) return null
        throw err
      }
    },
    enabled: !!eventId && !!email,
    retry: (failureCount, err) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) return false
      return failureCount < 3
    },
  })

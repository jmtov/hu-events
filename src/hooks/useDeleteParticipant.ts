import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance'

export const useDeleteParticipant = (eventId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => attendanceService.deleteParticipant(eventId, email),
    onSuccess: (_data, email) => {
      queryClient.removeQueries({ queryKey: ['participant', eventId, email] })
      queryClient.invalidateQueries({ queryKey: ['attendee-events'] })
    },
  })
}

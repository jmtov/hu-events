import { useMutation } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance'

type JoinPayload = {
  email: string
  full_name: string
  location_city: string
  location_region: string
  location_country: string
  role?: string
}

export const useAttendanceAction = (eventId: string) =>
  useMutation({
    mutationFn: async (payload: JoinPayload) => {
      await attendanceService.profile(eventId, payload)
      await attendanceService.rsvp(eventId, payload.email, 'confirmed')
    },
  })

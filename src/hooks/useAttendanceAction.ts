import { useMutation } from '@tanstack/react-query'
import { attendanceService } from '@/services/attendance'

type JoinPayload = {
  email: string
  full_name: string
  location_city: string
  location_region: string
  location_country: string
  role?: string
  rsvpStatus: 'confirmed' | 'pending'
}

export const useAttendanceAction = (eventId: string) =>
  useMutation({
    mutationFn: async (payload: JoinPayload) => {
      await attendanceService.profile(eventId, payload)
      if (payload.rsvpStatus !== 'pending') {
        await attendanceService.rsvp(eventId, payload.email, payload.rsvpStatus)
      }
    },
  })

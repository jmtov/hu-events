import { useQuery } from '@tanstack/react-query'
import { attendeeService } from '@/services/attendee'

export const useGetAttendeeEvents = (email: string | null) =>
  useQuery({
    queryKey: ['attendee-events', email],
    queryFn: () => attendeeService.getEvents(email!),
    enabled: !!email,
  })

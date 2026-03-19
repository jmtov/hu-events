import { createFileRoute } from '@tanstack/react-router';
import AttendeeLogin from '@/features/attendee/AttendeeLogin';

export const Route = createFileRoute('/attendee/login')({
  component: AttendeeLogin,
});

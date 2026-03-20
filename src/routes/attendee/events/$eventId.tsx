import { createFileRoute } from '@tanstack/react-router';
import AttendeeEventView from '@/features/attendee/AttendeeEventView';

const AttendeeEventPage = () => {
  const { eventId } = Route.useParams();
  return <AttendeeEventView eventId={eventId} />;
};

export const Route = createFileRoute('/attendee/events/$eventId')({
  component: AttendeeEventPage,
});

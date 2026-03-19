import { createFileRoute } from '@tanstack/react-router';
import AttendeeEventView from '@/features/attendee/AttendeeEventView';

const AttendeeEventPage = () => {
  const { eventId } = Route.useParams();
  const email = sessionStorage.getItem('humand_attendee_email');

  return <AttendeeEventView eventId={eventId} email={email} />;
};

export const Route = createFileRoute('/attendee/events/$eventId')({
  component: AttendeeEventPage,
});

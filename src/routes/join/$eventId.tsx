import { createFileRoute } from '@tanstack/react-router';
import AttendeeRegistrationForm from '@/features/attendee/AttendeeRegistrationForm';

const JoinPage = () => {
  const { eventId } = Route.useParams();

  return (
    <AttendeeRegistrationForm
      participantId={eventId}
      onSuccess={() => {
        // TODO: navigate to /attendee/events/:eventId once that route exists
      }}
    />
  );
};

export const Route = createFileRoute('/join/$eventId')({
  component: JoinPage,
});

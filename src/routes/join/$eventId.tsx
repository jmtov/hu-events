import { createFileRoute } from '@tanstack/react-router';
import HumandRegistrationPage from '@/features/attendee/HumandRegistrationPage';

const JoinPage = () => {
  const { eventId } = Route.useParams();
  return <HumandRegistrationPage eventId={eventId} />;
};

export const Route = createFileRoute('/join/$eventId')({
  component: JoinPage,
});

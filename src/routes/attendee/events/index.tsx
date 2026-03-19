import { createFileRoute, redirect } from '@tanstack/react-router';
import AttendeeEventList from '@/features/attendee/AttendeeEventList';

const AttendeeEventsPage = () => {
  const email = sessionStorage.getItem('humand_attendee_email');
  // email is guaranteed to exist here — beforeLoad redirects if missing
  return <AttendeeEventList email={email!} />;
};

export const Route = createFileRoute('/attendee/events/')({
  beforeLoad: () => {
    const email = sessionStorage.getItem('humand_attendee_email');
    if (!email) {
      throw redirect({ to: '/attendee/login' });
    }
  },
  component: AttendeeEventsPage,
});

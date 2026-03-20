import { createFileRoute, redirect } from '@tanstack/react-router';
import AttendeeEventList from '@/features/attendee/AttendeeEventList';
import { api } from '@/lib/api';

type SessionUser = { email: string; name: string; picture: string };

const AttendeeEventsPage = () => {
  const { email } = Route.useLoaderData();
  return <AttendeeEventList email={email} />;
};

export const Route = createFileRoute('/attendee/events/')({
  loader: async () => {
    try {
      const res = await api.get<SessionUser>('/auth/me');
      return { email: res.data.email };
    } catch {
      throw redirect({ to: '/attendee/login' });
    }
  },
  component: AttendeeEventsPage,
});

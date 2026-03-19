import { createFileRoute } from '@tanstack/react-router';
import EventContacts from '@/features/admin/EventContacts';

const EventContactsPage = () => {
  const { eventId } = Route.useParams();
  return <EventContacts eventId={eventId} />;
};

export const Route = createFileRoute('/admin/events/$eventId/contacts')({
  component: EventContactsPage,
});

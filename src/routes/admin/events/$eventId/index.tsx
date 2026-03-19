import { createFileRoute } from '@tanstack/react-router';
import EventDetail from '@/features/admin/EventDetail';

const EventDetailPage = () => {
  const { eventId } = Route.useParams();
  const { created } = Route.useSearch();

  return <EventDetail eventId={eventId} showSavedBanner={created ?? false} />;
};

export const Route = createFileRoute('/admin/events/$eventId/')({
  validateSearch: (search: Record<string, unknown>) => ({
    created: search.created === true || search.created === 'true',
  }),
  component: EventDetailPage,
});

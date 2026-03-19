import { createFileRoute } from '@tanstack/react-router';
import EventOverview from '@/features/admin/EventOverview';

const EventOverviewPage = () => {
  const { eventId } = Route.useParams();
  const { created } = Route.useSearch();

  return <EventOverview eventId={eventId} showSavedBanner={created ?? false} />;
};

export const Route = createFileRoute('/admin/events/$eventId')({
  validateSearch: (search: Record<string, unknown>) => ({
    created: search.created === true || search.created === 'true',
  }),
  component: EventOverviewPage,
});

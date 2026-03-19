import { createFileRoute } from '@tanstack/react-router';
import NotificationsPanel from '@/features/notifications/NotificationsPanel';

const NotificationsPage = () => {
  const { eventId } = Route.useParams();

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Configure when and how attendees and admins are notified.
        </p>
      </div>
      <NotificationsPanel eventId={eventId} />
    </div>
  );
};

export const Route = createFileRoute('/admin/events/$eventId/notifications')({
  component: NotificationsPage,
});

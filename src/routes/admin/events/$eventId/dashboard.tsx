import { createFileRoute } from '@tanstack/react-router';

const DashboardPage = () => {
  const { eventId } = Route.useParams();

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-lg font-semibold">Event Dashboard</h1>
      <p className="text-sm text-muted-foreground">{eventId}</p>
    </div>
  );
};

export const Route = createFileRoute('/admin/events/$eventId/dashboard')({
  component: DashboardPage,
});

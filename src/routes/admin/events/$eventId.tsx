import { createFileRoute, Outlet } from '@tanstack/react-router';

const EventConfigPage = () => {
  const { eventId } = Route.useParams();

  return (
    <>
      <div className="p-8">
        <h1>Configuración del evento</h1>
        <p className="text-muted-foreground">
          F-02 — Module toggle panel (placeholder)
        </p>
        <p className="text-sm text-muted-foreground">eventId: {eventId}</p>
      </div>
      <Outlet />
    </>
  );
};

export const Route = createFileRoute('/admin/events/$eventId')({
  component: EventConfigPage,
});

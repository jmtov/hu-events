import { createFileRoute } from '@tanstack/react-router';

const CreateEventPage = () => {
  return (
    <div className="p-8">
      <h1>Crear evento</h1>
      <p className="text-muted-foreground">F-01 — Create event (placeholder)</p>
    </div>
  );
};

export const Route = createFileRoute('/admin/events/new')({
  component: CreateEventPage,
});

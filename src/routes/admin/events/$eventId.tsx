import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useGetEvent } from '@/hooks/useGetEvent';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ModulePanel from '@/features/events/ModulePanel';
import { cn } from '@/lib/utils';

const EventConfigPage = () => {
  const { eventId } = Route.useParams();
  const { data: event, isPending, isError } = useGetEvent(eventId);

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading event...</p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-destructive">Event not found.</p>
        <Link to="/" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
          Back to home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date_start).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Success banner */}
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-sm font-medium text-green-800">
            Event created successfully!
          </p>
          <p className="mt-0.5 text-sm text-green-700">
            Your event is ready. You can now configure its modules below.
          </p>
        </div>

        {/* Event summary card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <Badge variant="secondary" className="shrink-0 capitalize">
                {event.event_type.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{event.description}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3">
              <span>
                <span className="font-medium text-foreground">Start: </span>
                {formattedDate}
              </span>
              {event.location && (
                <span>
                  <span className="font-medium text-foreground">Location: </span>
                  {event.location}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Module toggle panel */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Modules
          </h2>
          <ModulePanel event={event} />
        </div>

        <div className="mt-6 flex justify-start">
          <Link
            to="/admin/events/new"
            className={buttonVariants({ variant: 'outline' })}
          >
            Create another event
          </Link>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export const Route = createFileRoute('/admin/events/$eventId')({
  component: EventConfigPage,
});

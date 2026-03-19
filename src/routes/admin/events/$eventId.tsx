import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useGetEvent } from '@/hooks/useGetEvent';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ModulePanel from '@/features/events/ModulePanel';
import { cn } from '@/lib/utils';

const EventConfigPage = () => {
  const { t } = useTranslation('admin');
  const { eventId } = Route.useParams();
  const isOnChildRoute = useRouterState({
    select: (s) => s.location.pathname !== `/admin/events/${eventId}`,
  });
  const { data: event, isPending, isError } = useGetEvent(eventId);

  // Sub-routes (e.g. checklist) render as standalone pages — not nested below this layout
  if (isOnChildRoute) return <Outlet />;

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('events.config.loading')}</p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-destructive">{t('events.config.notFound')}</p>
        <Link to="/" className={cn(buttonVariants({ variant: 'outline' }), 'mt-4')}>
          {t('events.config.backToHome')}
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
            {t('events.config.successTitle')}
          </p>
          <p className="mt-0.5 text-sm text-green-700">
            {t('events.config.successDescription')}
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
                <span className="font-medium text-foreground">
                  {t('events.config.dateStart')}
                </span>{' '}
                {formattedDate}
              </span>
              {event.location && (
                <span>
                  <span className="font-medium text-foreground">
                    {t('events.config.location')}
                  </span>{' '}
                  {event.location}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Module toggle panel */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {t('events.modules.title')}
          </h2>
          <ModulePanel event={event} />
        </div>

        <div className="mt-6 flex justify-start">
          <Link
            to="/admin/events/new"
            className={buttonVariants({ variant: 'outline' })}
          >
            {t('events.config.createAnother')}
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

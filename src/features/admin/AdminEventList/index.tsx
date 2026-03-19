import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAdminEvents } from '@/hooks/useGetAdminEvents';
import { cn } from '@/lib/utils';
import type { AdminEventSummary } from '@/types/event';

type EventStatus = 'upcoming' | 'ongoing' | 'past';

function getEventStatus(event: AdminEventSummary): EventStatus {
  const now = new Date();
  const start = new Date(event.date_start);
  const end = event.date_end ? new Date(event.date_end) : start;
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

const STATUS_VARIANT: Record<EventStatus, 'default' | 'secondary' | 'outline'> =
  {
    upcoming: 'default',
    ongoing: 'secondary',
    past: 'outline',
  };

const AdminEventList = () => {
  const { t } = useTranslation('admin');
  const { data: events, isPending, isError } = useGetAdminEvents();

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t('events.list.loading')}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-destructive">{t('events.list.error')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('events.list.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('events.list.subtitle')}
          </p>
        </div>
        <Link to="/admin/events/new" className={buttonVariants()}>
          {t('events.list.createCta')}
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-base font-medium text-foreground">
            {t('events.list.empty.title')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('events.list.empty.description')}
          </p>
          <Link to="/admin/events/new" className={cn(buttonVariants(), 'mt-6')}>
            {t('events.list.empty.cta')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event, index) => {
            const status = getEventStatus(event);
            const formattedDate = new Date(event.date_start).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              },
            );

            return (
              <Link
                key={event.id}
                to="/admin/events/$eventId"
                params={{ eventId: event.id }}
                search={{ created: false }}
                className="group block animate-appear-from-bottom"
                style={{ animationDelay: `calc(${index} * 50ms)` }}
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug group-hover:text-primary">
                        {event.title}
                      </CardTitle>
                      <Badge
                        variant={STATUS_VARIANT[status]}
                        className="shrink-0 capitalize"
                      >
                        {t(`events.list.status.${status}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>{formattedDate}</span>
                      <Badge variant="outline" className="capitalize">
                        {t(`eventTypes.${event.event_type}`)}
                      </Badge>
                    </div>
                    <p className="text-xs">
                      {t('events.list.rsvpCount', { count: event.rsvp_count })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminEventList;

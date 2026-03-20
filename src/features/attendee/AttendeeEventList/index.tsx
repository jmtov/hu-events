import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAttendeeEvents } from '@/hooks/useGetAttendeeEvents';
import { api } from '@/lib/api';
import type { AttendeeEventSummary } from '@/services/attendee';
import { Link } from '@tanstack/react-router';

type EventStatus = 'upcoming' | 'ongoing' | 'past';

function getEventStatus(event: AttendeeEventSummary): EventStatus {
  const now = new Date();
  const start = new Date(event.date_start);
  const end = event.date_end ? new Date(event.date_end) : start;
  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
}

const STATUS_VARIANT: Record<EventStatus, 'default' | 'secondary' | 'outline'> = {
  upcoming: 'default',
  ongoing: 'secondary',
  past: 'outline',
};

const RSVP_VARIANT: Record<AttendeeEventSummary['rsvp_status'], 'default' | 'secondary' | 'outline'> = {
  confirmed: 'default',
  pending: 'secondary',
  declined: 'outline',
};

type AttendeeEventListProps = {
  email: string;
};

const AttendeeEventList = ({ email }: AttendeeEventListProps) => {
  const { t } = useTranslation('attendee');
  const router = useRouter();
  const { data: events, isPending, isError } = useGetAttendeeEvents(email);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    router.navigate({ to: '/attendee/login' });
  };

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">{t('eventList.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <p className="text-sm text-destructive">{t('eventList.error')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 py-10">
      <div className="flex-1">
      <div
        className="animate-appear-from-bottom mb-8 flex items-start justify-between gap-4"
        style={{ animationDelay: 'calc(0 * 50ms)' }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('eventList.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div
          className="animate-appear-from-bottom rounded-xl border border-dashed border-border px-6 py-16 text-center"
          style={{ animationDelay: 'calc(1 * 50ms)' }}
        >
          <p className="text-base font-medium text-foreground">{t('eventList.empty.title')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('eventList.empty.description')}</p>
          <Button variant="outline" className="mt-6" onClick={handleLogout}>
            {t('eventList.empty.cta')}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            const status = getEventStatus(event);
            const formattedDate = new Date(event.date_start).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Link
                key={event.id}
                to="/attendee/events/$eventId"
                params={{ eventId: event.id }}
                className="group block animate-appear-from-bottom"
                style={{ animationDelay: `calc(${index + 1} * 50ms)` }}
              >
                <Card className="transition-shadow group-hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base leading-snug group-hover:text-primary">
                        {event.title}
                      </CardTitle>
                      <Badge variant={STATUS_VARIANT[status]} className="shrink-0">
                        {t(`eventList.status.${status}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>{formattedDate}</span>
                      {event.location && (
                        <span className="text-xs">{event.location}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={RSVP_VARIANT[event.rsvp_status]} className="text-xs">
                        {t(`eventList.rsvp.${event.rsvp_status}`)}
                      </Badge>
                      {event.checklist_total > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t('eventList.checklist', {
                            completed: event.checklist_completed,
                            total: event.checklist_total,
                          })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      </div>

      <div className="mt-12 flex items-center justify-center border-t border-border pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-xs text-muted-foreground"
        >
          {t('eventList.logout')}
        </Button>
      </div>
    </div>
  );
};

export default AttendeeEventList;

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/types/event';

interface EventHeaderProps {
  event: Event;
}

const EventHeader = ({ event }: EventHeaderProps) => {
  const { t } = useTranslation('admin');

  const formattedStart = new Date(event.date_start).toLocaleDateString(
    undefined,
    { day: '2-digit', month: 'short', year: 'numeric' },
  );

  const formattedEnd = event.date_end
    ? new Date(event.date_end).toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="rounded-xl border bg-card px-6 py-5 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('events.overview.header.label')}
      </p>
      <h1 className="mb-3 text-2xl font-bold text-foreground">
        {event.title}
      </h1>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {t(`eventTypes.${event.event_type}`)}
        </Badge>
        {event.location && (
          <Badge variant="outline">{event.location}</Badge>
        )}
        <Badge variant="outline">
          {formattedStart}
          {formattedEnd && formattedEnd !== formattedStart
            ? ` — ${formattedEnd}`
            : ''}
        </Badge>
      </div>
    </div>
  );
};

export default EventHeader;

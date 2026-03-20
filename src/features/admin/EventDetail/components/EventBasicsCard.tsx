import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@/types/event';

type EventBasicsCardProps = {
  event: Event;
};

const EventBasicsCard = ({ event }: EventBasicsCardProps) => {
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
    <Card>
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <div className="mt-2 flex flex-wrap gap-2">
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
      </CardHeader>
      {event.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{event.description}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default EventBasicsCard;

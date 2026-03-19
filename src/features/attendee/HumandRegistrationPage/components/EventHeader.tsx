import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { Event } from '@/types/event';

type EventHeaderProps = {
  event: Event;
};

const EventHeader = ({ event }: EventHeaderProps) => {
  const { t } = useTranslation('attendee');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('registration.brand')}
          </p>
          <p className="text-sm font-bold text-foreground">
            {t('registration.subtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pb-4 pt-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-foreground">{event.title}</h1>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">
              <IconCalendar className="size-3" />
              {new Date(event.date_start).toLocaleDateString()}
            </Badge>
            {event.location && (
              <Badge variant="secondary">
                <IconMapPin className="size-3" />
                {event.location}
              </Badge>
            )}
            <Badge variant="outline">{event.event_type}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventHeader;

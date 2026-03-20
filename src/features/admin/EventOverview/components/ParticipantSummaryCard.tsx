import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Participant, RsvpStatus } from '@/types/participant';

const RSVP_BADGE_STYLES: Record<RsvpStatus, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  declined: 'bg-red-100 text-red-800 border-red-200',
};

type ParticipantSummaryCardProps = {
  participants: Participant[];
  style?: React.CSSProperties;
};

const PREVIEW_LIMIT = 5;

const ParticipantSummaryCard = ({
  participants,
  style,
}: ParticipantSummaryCardProps) => {
  const { t } = useTranslation('admin');
  const preview = participants.slice(0, PREVIEW_LIMIT);
  const remaining = participants.length - preview.length;

  return (
    <Card className="animate-appear-from-bottom" style={style}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.participants.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            {t('events.overview.participants.empty')}
          </p>
        ) : (
          <ul className="space-y-2">
            {preview.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex flex-col items-start min-w-0 ">
                  <span className="truncate text-sm text-foreground">
                    {p.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.email}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 min-w-0 ">
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 px-1.5 py-0 text-[10px]',
                      RSVP_BADGE_STYLES[p.rsvp_status],
                    )}
                  >
                    {t(`events.overview.rsvp.${p.rsvp_status}`)}
                  </Badge>
                </div>
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-xs text-muted-foreground">
                +{remaining} {t('events.overview.participants.more')}
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipantSummaryCard;

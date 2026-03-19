import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Participant } from '@/types/participant';

interface RsvpCardProps {
  participants: Participant[];
}

type StatusConfig = {
  label: string;
  dotClass: string;
  countClass: string;
};

const RsvpCard = ({ participants }: RsvpCardProps) => {
  const { t } = useTranslation('admin');

  const confirmed = participants.filter(
    (p) => p.rsvp_status === 'confirmed',
  ).length;
  const pending = participants.filter(
    (p) => p.rsvp_status === 'pending',
  ).length;
  const declined = participants.filter(
    (p) => p.rsvp_status === 'declined',
  ).length;
  const total = participants.length;
  const confirmationPct =
    total > 0 ? Math.round((confirmed / total) * 100) : 0;

  const statuses: Array<{ key: 'confirmed' | 'pending' | 'declined'; count: number; config: StatusConfig }> = [
    {
      key: 'confirmed',
      count: confirmed,
      config: {
        label: t('events.overview.rsvp.confirmed'),
        dotClass: 'bg-green-500',
        countClass: 'text-green-700',
      },
    },
    {
      key: 'pending',
      count: pending,
      config: {
        label: t('events.overview.rsvp.pending'),
        dotClass: 'bg-amber-400',
        countClass: 'text-amber-700',
      },
    },
    {
      key: 'declined',
      count: declined,
      config: {
        label: t('events.overview.rsvp.declined'),
        dotClass: 'bg-red-400',
        countClass: 'text-red-700',
      },
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.rsvp.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {confirmed}
            </span>
            <span className="text-sm text-muted-foreground">/ {total}</span>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            {t('events.overview.rsvp.confirmedOf', { confirmed, total })}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${confirmationPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-green-600">
            {t('events.overview.rsvp.confirmationRate', {
              pct: confirmationPct,
            })}
          </p>
        </div>

        <div className="space-y-2">
          {statuses.map(({ key, count, config }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${config.dotClass}`}
                />
                <span className="text-xs text-muted-foreground">
                  {config.label}
                </span>
              </div>
              <span className={`text-xs font-bold ${config.countClass}`}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RsvpCard;

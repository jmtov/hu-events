import { useTranslation } from 'react-i18next';
import {
  IconBrandSlack,
  IconBrandWhatsapp,
  IconMail,
} from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Trigger, TriggerChannel } from '@/types/trigger';

type NotificationsSummaryCardProps = {
  triggers: Trigger[];
};

const CHANNEL_ICON: Record<TriggerChannel, React.ReactNode> = {
  slack: <IconBrandSlack size={14} />,
  email: <IconMail size={14} />,
  whatsapp: <IconBrandWhatsapp size={14} />,
};

const NotificationsSummaryCard = ({
  triggers,
}: NotificationsSummaryCardProps) => {
  const { t } = useTranslation('admin');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.notifications.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {triggers.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            {t('events.overview.notifications.noTriggers')}
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {t('events.overview.notifications.count', {
                count: triggers.length,
              })}
            </p>
            <div className="space-y-2">
              {triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex-1 truncate text-xs font-medium text-foreground leading-snug">
                    {trigger.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    {CHANNEL_ICON[trigger.channel]}
                    <span className="text-[11px]">
                      {trigger.timing === 'immediately'
                        ? t('events.overview.notifications.timing.immediately')
                        : trigger.timing === 'days_before'
                          ? t('events.overview.notifications.timing.daysBefore', {
                              count: trigger.timingValue,
                            })
                          : t('events.overview.notifications.timing.hoursAfter', {
                              count: trigger.timingValue,
                            })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsSummaryCard;

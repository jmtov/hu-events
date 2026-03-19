import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CHECKLIST_TYPE_COLORS } from '@/types/checklist';
import type { ChecklistEntry } from '@/types/event';

type ChecklistProgressCardProps = {
  items: ChecklistEntry[];
};

const ChecklistProgressCard = ({ items }: ChecklistProgressCardProps) => {
  const { t } = useTranslation('admin');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.checklist.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            {t('events.overview.checklist.noItems')}
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              {t('events.overview.checklist.items', { count: items.length })}
            </p>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex-1 truncate text-xs font-medium text-foreground leading-snug">
                    {item.label}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0 text-[10px] font-medium ring-1 ring-inset ${CHECKLIST_TYPE_COLORS[item.item_type]}`}
                    >
                      {t(`events.overview.checklist.type.${item.item_type}`)}
                    </span>
                    {item.required && (
                      <Badge
                        variant="outline"
                        className="px-1.5 py-0 text-[10px]"
                      >
                        {t('events.overview.checklist.required')}
                      </Badge>
                    )}
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

export default ChecklistProgressCard;

import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EventChecklistStat } from '@/types/checklist';

interface ChecklistProgressCardProps {
  stats: EventChecklistStat[];
}

const ChecklistProgressCard = ({ stats }: ChecklistProgressCardProps) => {
  const { t } = useTranslation('admin');

  const overallPct =
    stats.length > 0
      ? Math.round(
          stats.reduce((sum, s) => sum + s.completion_pct, 0) / stats.length,
        )
      : 0;

  const barColor = (pct: number) => {
    if (pct >= 75) return 'bg-green-500';
    if (pct >= 40) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.checklist.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {overallPct}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">
              %
            </span>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            {t('events.overview.checklist.averageCompletion')}
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor(overallPct)}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('events.overview.checklist.items', { count: stats.length })}
          </p>
        </div>

        {stats.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground">
            {t('events.overview.checklist.noItems')}
          </p>
        ) : (
          <div className="space-y-3">
            {stats.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex-1 text-xs font-medium text-foreground leading-snug">
                    {item.label}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    {item.required && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {t('events.overview.checklist.required')}
                      </Badge>
                    )}
                    <span
                      className={`text-xs font-bold ${barColor(item.completion_pct).replace('bg-', 'text-')}`}
                    >
                      {item.completion_pct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor(item.completion_pct)}`}
                    style={{ width: `${item.completion_pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {t('events.overview.checklist.completedOf', {
                    completed: item.completed_count,
                    total: item.total_count,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistProgressCard;

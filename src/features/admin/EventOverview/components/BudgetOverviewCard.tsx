import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetBudget } from '@/hooks/useGetBudget';

type BudgetOverviewCardProps = {
  eventId: string;
};

const BudgetOverviewCard = ({ eventId }: BudgetOverviewCardProps) => {
  const { t } = useTranslation('admin');
  const { data: budget } = useGetBudget(eventId);

  const activeCategories = (budget?.categories ?? []).filter(
    (c) => c.enabled && c.cap !== null,
  );

  const totalMax = activeCategories.reduce((sum, c) => sum + (c.cap ?? 0), 0);
  const topCategories = activeCategories.slice(0, 3);
  const hasCaps = activeCategories.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.budget.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          {hasCaps ? (
            <>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  ${totalMax}
                </span>
                <span className="text-sm text-muted-foreground">USD</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('events.overview.budget.totalMax')}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('events.overview.budget.noCaps')}
            </p>
          )}
        </div>

        {topCategories.length > 0 && (
          <div className="space-y-2">
            {topCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t(`events.create.budget.categories.${category.key}`, {
                    defaultValue: category.label,
                  })}
                </span>
                <span className="text-xs font-bold tabular-nums text-foreground">
                  ${category.cap}
                </span>
              </div>
            ))}
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default BudgetOverviewCard;

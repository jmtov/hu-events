import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetBudget } from '@/hooks/useGetBudget';

type BudgetStatsCardProps = {
  eventId: string;
  participantCount: number;
  expectedAttendees: number | null;
};

const BudgetStatsCard = ({ eventId, participantCount, expectedAttendees }: BudgetStatsCardProps) => {
  const { t } = useTranslation('admin');
  const { data: budget } = useGetBudget(eventId);

  const activeCategories = (budget?.categories ?? []).filter(
    (c) => c.enabled && c.cap !== null,
  );

  const budgetPerPerson = activeCategories.reduce((sum, c) => sum + (c.cap ?? 0), 0);
  const currency = budget?.currency ?? 'USD';
  const totalRegistered = budgetPerPerson * participantCount;
  const hasData = activeCategories.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t('events.overview.budgetStats.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            {t('events.overview.budget.noCaps')}
          </p>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  ${budgetPerPerson.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">{currency}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('events.overview.budgetStats.perPerson')}
              </p>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">
                  ${totalRegistered.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">{currency}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('events.overview.budgetStats.totalRegistered', { count: participantCount })}
              </p>
            </div>

            {expectedAttendees !== null && expectedAttendees > 0 && (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">
                    ${(budgetPerPerson * expectedAttendees).toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">{currency}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('events.overview.budgetStats.expectedTotal', { count: expectedAttendees })}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetStatsCard;

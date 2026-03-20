import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventModules } from '@/types/event';

const MODULE_KEYS = [
  'participantList',
  'checklist',
  'budget',
  'notifications',
  'contacts',
] as const;

type ModuleKey = (typeof MODULE_KEYS)[number];

type ModulesCardProps = {
  modules: EventModules;
};

const ModulesCard = ({ modules }: ModulesCardProps) => {
  const { t } = useTranslation('admin');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('events.detail.modules.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border">
          {MODULE_KEYS.map((key: ModuleKey) => {
            const isActive = modules[key];
            return (
              <li key={key} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-foreground">
                  {t(`events.modules.${key}.label`)}
                </span>
                <span
                  className={
                    isActive
                      ? 'text-xs font-semibold text-green-700 dark:text-green-400'
                      : 'text-xs font-medium text-muted-foreground'
                  }
                >
                  {isActive
                    ? t('events.detail.modules.active')
                    : t('events.detail.modules.inactive')}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ModulesCard;

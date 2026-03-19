import { IconSparkles, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useEstimateBudget } from '@/hooks/useEstimateBudget';
import { cn } from '@/lib/utils';
import type { BudgetCategory } from '@/types/budget';

// ─── CategoryRow ─────────────────────────────────────────────────────────────

type CategoryRowProps = {
  category: BudgetCategory;
  onToggle: (enabled: boolean) => void;
  onCapChange: (cap: number | null) => void;
  onRemove?: () => void;
};

const CategoryRow = ({ category, onToggle, onCapChange, onRemove }: CategoryRowProps) => {
  const { t } = useTranslation('admin');

  const handleCapInput = (raw: string) => {
    const parsed = parseFloat(raw);
    onCapChange(raw === '' || isNaN(parsed) ? null : Math.round(parsed));
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-opacity',
        !category.enabled && 'opacity-50',
      )}
    >
      <Switch
        checked={category.enabled}
        onCheckedChange={onToggle}
        aria-label={`Toggle ${category.label}`}
      />

      {/* Label — built-in keys are translated; custom categories fall back to stored label */}
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {t(`events.create.budget.categories.${category.key}`, { defaultValue: category.label })}
      </span>

      {/* AI estimate badge */}
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {category.ai_estimate !== null ? (
          <span className="inline-flex items-center gap-1">
            <IconSparkles size={11} />
            ${category.ai_estimate}
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </span>

      {/* Cap input */}
      <div className="relative w-28 shrink-0">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          $
        </span>
        <Input
          type="number"
          min={0}
          step={1}
          disabled={!category.enabled}
          placeholder={t('events.create.budget.capPlaceholder')}
          value={category.cap ?? ''}
          onChange={(e) => handleCapInput(e.target.value)}
          className="h-8 pl-5 text-sm"
          aria-label={`${category.label} cap`}
        />
      </div>

      {/* Remove button — only for custom categories */}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
          aria-label={t('events.create.budget.removeCategory')}
        >
          <IconTrash size={14} />
        </button>
      )}
    </div>
  );
};

// ─── BudgetModule ─────────────────────────────────────────────────────────────

type BudgetModuleProps = {
  categories: BudgetCategory[];
  onCategoriesChange: (categories: BudgetCategory[]) => void;
  /** From the parent form — used to build the AI estimation payload. */
  eventType?: string;
  description?: string;
  dateStart?: string;
  dateEnd?: string;
  location?: string;
};

const BudgetModule = ({
  categories,
  onCategoriesChange,
  eventType,
  description,
  dateStart,
  dateEnd,
  location,
}: BudgetModuleProps) => {
  const { t } = useTranslation('admin');
  const estimateBudget = useEstimateBudget();

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [aiError, setAiError] = useState<string | null>(null);

  // Reactive total: sum of caps for enabled categories that have a cap set
  const totalMax = categories
    .filter((c) => c.enabled && c.cap !== null)
    .reduce((sum, c) => sum + (c.cap ?? 0), 0);

  const hasAnyCap = categories.some((c) => c.enabled && c.cap !== null);

  const updateCategory = (key: string, patch: Partial<BudgetCategory>) => {
    onCategoriesChange(categories.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };

  const handleEstimate = async () => {
    const enabledKeys = categories.filter((c) => c.enabled).map((c) => c.key);
    if (enabledKeys.length === 0 || !dateStart) return;

    setAiError(null);

    try {
      const result = await estimateBudget.mutateAsync({
        event_type: eventType ?? 'corporate event',
        description: description ?? null,
        date_start: dateStart,
        date_end: dateEnd ?? null,
        destination: location ?? null,
        participants: [],
        category_keys: enabledKeys,
      });

      // Pre-fill caps with AI estimates (admin can override)
      onCategoriesChange(
        categories.map((c) => {
          const estimate = result.estimates[c.key];
          if (estimate !== undefined) {
            return { ...c, ai_estimate: estimate, cap: estimate };
          }
          return c;
        }),
      );
    } catch {
      setAiError(t('events.create.budget.aiError'));
    }
  };

  const handleAddCustom = () => {
    if (!customLabel.trim()) return;
    const newCategory: BudgetCategory = {
      key: `custom_${Date.now()}`,
      label: customLabel.trim(),
      enabled: true,
      ai_estimate: null,
      cap: null,
      is_custom: true,
    };
    onCategoriesChange([...categories, newCategory]);
    setCustomLabel('');
    setIsAddingCustom(false);
  };

  const noneEnabled = categories.every((c) => !c.enabled);

  return (
    <div className="space-y-4">
      {/* Total max banner */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
        <p className="text-sm font-medium text-foreground">
          {t('events.create.budget.totalMax')}
        </p>
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {hasAnyCap ? `$${totalMax} USD` : t('events.create.budget.totalMaxNone')}
        </p>
      </div>

      {/* Description + AI button */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t('events.create.budget.description')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={handleEstimate}
          disabled={estimateBudget.isPending || noneEnabled || !dateStart}
        >
          <IconSparkles size={14} />
          {estimateBudget.isPending
            ? t('events.create.budget.estimating')
            : t('events.create.budget.estimateWithAI')}
        </Button>
      </div>

      {aiError && <p className="text-sm text-destructive">{aiError}</p>}

      {/* Category rows */}
      <div className="space-y-2">
        {categories.map((category) => (
          <CategoryRow
            key={category.key}
            category={category}
            onToggle={(enabled) => updateCategory(category.key, { enabled })}
            onCapChange={(cap) => updateCategory(category.key, { cap })}
            onRemove={
              category.is_custom
                ? () =>
                    onCategoriesChange(categories.filter((c) => c.key !== category.key))
                : undefined
            }
          />
        ))}
      </div>

      {/* Add custom category */}
      {isAddingCustom ? (
        <div className="flex items-center gap-2">
          <Input
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder={t('events.create.budget.customLabelPlaceholder')}
            className="h-8 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustom();
              }
              if (e.key === 'Escape') {
                setIsAddingCustom(false);
                setCustomLabel('');
              }
            }}
          />
          <Button type="button" size="sm" onClick={handleAddCustom}>
            {t('events.create.budget.addCustomConfirm')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAddingCustom(false);
              setCustomLabel('');
            }}
          >
            {t('common.cancel')}
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsAddingCustom(true)}
        >
          + {t('events.create.budget.addCustom')}
        </Button>
      )}
    </div>
  );
};

export default BudgetModule;

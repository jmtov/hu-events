import { IconCheck, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PreferenceFieldSuggestion } from '@/types/participant';
import { normaliseSuggestionType } from '@/types/participant';
import { PREFERENCE_FIELD_TYPE_COLORS, PREFERENCE_FIELD_TYPE_LABELS } from './constants';

type SuggestedFieldCardProps = {
  suggestion: PreferenceFieldSuggestion;
  onAccept: () => void;
  onDiscard: () => void;
  isPending?: boolean;
};

const SuggestedFieldCard = ({
  suggestion,
  onAccept,
  onDiscard,
  isPending = false,
}: SuggestedFieldCardProps) => {
  const fieldType = normaliseSuggestionType(suggestion.inputType);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm ring-1 ring-amber-300/40">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="truncate font-medium text-card-foreground">{suggestion.label}</span>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
              PREFERENCE_FIELD_TYPE_COLORS[fieldType],
            )}
          >
            {PREFERENCE_FIELD_TYPE_LABELS[fieldType]}
          </span>
        </div>
        {suggestion.options && suggestion.options.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {suggestion.options.join(' · ')}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onAccept}
          disabled={isPending}
          aria-label="Aceitar sugestão"
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        >
          <IconCheck size={15} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDiscard}
          disabled={isPending}
          aria-label="Descartar sugestão"
          className="text-muted-foreground hover:text-destructive"
        >
          <IconX size={15} />
        </Button>
      </div>
    </div>
  );
};

export default SuggestedFieldCard;

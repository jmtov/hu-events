import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  PREFERENCE_FIELD_TYPE_COLORS,
  PREFERENCE_FIELD_TYPE_LABELS,
  type PreferenceFieldValues,
} from './constants';

export type DraftField = PreferenceFieldValues & { _key: string };

type PreferenceFieldRowProps = {
  field: DraftField;
  onEdit: () => void;
  onDelete: () => void;
};

const PreferenceFieldRow = ({ field, onEdit, onDelete }: PreferenceFieldRowProps) => {
  const optionsList =
    field.field_type === 'select' && field.options_raw
      ? field.options_raw
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : [];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="truncate font-medium text-card-foreground">{field.label}</span>
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
              PREFERENCE_FIELD_TYPE_COLORS[field.field_type],
            )}
          >
            {PREFERENCE_FIELD_TYPE_LABELS[field.field_type]}
          </span>
        </div>
        {optionsList.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {optionsList.join(' · ')}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {field.required && (
          <span className="text-xs text-muted-foreground">Obrigatório</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label="Editar campo"
        >
          <IconPencil size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="Deletar campo"
          className="text-destructive hover:text-destructive"
        >
          <IconTrash size={14} />
        </Button>
      </div>
    </div>
  );
};

export default PreferenceFieldRow;

import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  CHECKLIST_TYPE_COLORS,
  CHECKLIST_TYPE_LABELS,
} from '@/types/checklist';
import type { ChecklistItemValues } from '@/features/checklist/constants';

export type DraftItem = ChecklistItemValues & { _key: string };

type DraftItemRowProps = {
  item: DraftItem;
  onEdit: () => void;
  onDelete: () => void;
};

const DraftItemRow = ({ item, onEdit, onDelete }: DraftItemRowProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="truncate font-medium text-card-foreground">
        {item.name}
      </span>
      <span
        className={cn(
          'inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
          CHECKLIST_TYPE_COLORS[item.type],
        )}
      >
        {CHECKLIST_TYPE_LABELS[item.type]}
      </span>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {item.required && (
        <span className="text-xs text-muted-foreground">Required</span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
        aria-label="Edit item"
      >
        <IconPencil size={14} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label="Delete item"
        className="text-destructive hover:text-destructive"
      >
        <IconTrash size={14} />
      </Button>
    </div>
  </div>
);

export default DraftItemRow;

import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDeleteChecklistItem } from '@/hooks/useDeleteChecklistItem';
import { useUpdateChecklistItem } from '@/hooks/useUpdateChecklistItem';
import { cn } from '@/lib/utils';
import type { ChecklistItemValues } from './constants';
import {
  CHECKLIST_TYPE_COLORS,
  CHECKLIST_TYPE_LABELS,
  type ChecklistItem,
} from '@/types/checklist';
import ChecklistItemForm from './ChecklistItemForm';

type ChecklistItemRowProps = {
  item: ChecklistItem;
  eventId: string;
};

const ChecklistItemRow = ({ item, eventId }: ChecklistItemRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateItem = useUpdateChecklistItem(eventId);
  const deleteItem = useDeleteChecklistItem(eventId);

  const handleUpdate = async (values: ChecklistItemValues) => {
    await updateItem.mutateAsync({ itemId: item.id, payload: values });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <ChecklistItemForm
        defaultValues={{
          name: item.name,
          type: item.type,
          required: item.required,
        }}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
        isPending={updateItem.isPending}
      />
    );
  }

  return (
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
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsEditing(true)}
          aria-label="Edit item"
        >
          <IconPencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => deleteItem.mutate(item.id)}
          disabled={deleteItem.isPending}
          aria-label="Delete item"
          className="text-destructive hover:text-destructive"
        >
          <IconTrash size={14} />
        </Button>
      </div>
    </div>
  );
};

export default ChecklistItemRow;

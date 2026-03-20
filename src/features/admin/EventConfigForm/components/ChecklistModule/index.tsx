import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { ChecklistItemValues } from './constants';
import ChecklistItemForm from './ChecklistItemForm';
import DraftItemRow, { type DraftItem } from './DraftItemRow';

type ChecklistModuleProps = {
  draftItems: DraftItem[];
  isAddingItem: boolean;
  editingKey: string | null;
  onAddItem: (values: ChecklistItemValues) => void;
  onUpdateItem: (key: string, values: ChecklistItemValues) => void;
  onDeleteItem: (key: string) => void;
  onSetAddingItem: (value: boolean) => void;
  onSetEditingKey: (key: string | null) => void;
};

const ChecklistModule = ({
  draftItems,
  isAddingItem,
  editingKey,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onSetAddingItem,
  onSetEditingKey,
}: ChecklistModuleProps) => {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('events.create.checklist.description')}
      </p>

      {draftItems.length === 0 && !isAddingItem && (
        <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t('events.create.checklist.empty')}
          </p>
        </div>
      )}

      {draftItems.map((item) =>
        editingKey === item._key ? (
          <ChecklistItemForm
            key={item._key}
            defaultValues={item}
            onSubmit={(values) => onUpdateItem(item._key, values)}
            onCancel={() => onSetEditingKey(null)}
            asDiv
          />
        ) : (
          <DraftItemRow
            key={item._key}
            item={item}
            onEdit={() => onSetEditingKey(item._key)}
            onDelete={() => onDeleteItem(item._key)}
          />
        ),
      )}

      {isAddingItem ? (
        <ChecklistItemForm
          onSubmit={onAddItem}
          onCancel={() => onSetAddingItem(false)}
          asDiv
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSetAddingItem(true)}
        >
          + {t('events.create.checklist.addItem')}
        </Button>
      )}
    </div>
  );
};

export default ChecklistModule;

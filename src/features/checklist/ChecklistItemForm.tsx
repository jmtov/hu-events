import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  checklistItemSchema,
  type ChecklistItemValues,
} from '@/schemas/checklist';

type ChecklistItemFormProps = {
  defaultValues?: Partial<ChecklistItemValues>;
  onSubmit: (values: ChecklistItemValues) => Promise<void> | void;
  onCancel: () => void;
  isPending?: boolean;
};

const ITEM_TYPE_LABELS: Record<ChecklistItemValues['type'], string> = {
  checkbox: 'Checkbox item',
  document_upload: 'Document upload',
  info_input: 'Text response',
};

type ToggleProps = {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
};

const Toggle = ({ id, checked, onChange, label, description }: ToggleProps) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        checked ? 'bg-primary' : 'bg-input',
      )}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  </div>
);

const ChecklistItemForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending = false,
}: ChecklistItemFormProps) => {
  const form = useForm<ChecklistItemValues>({
    resolver: zodResolver(checklistItemSchema),
    defaultValues: {
      name: '',
      type: 'checkbox',
      required: false,
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="checklist-item-name">
          Item name <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="space-y-1">
              <Input
                id="checklist-item-name"
                placeholder="e.g. Upload passport, Confirm dietary restrictions"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && (
                <p className="text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label htmlFor="checklist-item-type">Type</Label>
        <Controller
          name="type"
          control={form.control}
          render={({ field }) => (
            <select
              id="checklist-item-type"
              value={field.value}
              onChange={(e) =>
                field.onChange(e.target.value as ChecklistItemValues['type'])
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {(
                Object.keys(ITEM_TYPE_LABELS) as ChecklistItemValues['type'][]
              ).map((key) => (
                <option key={key} value={key}>
                  {ITEM_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      {/* Required toggle */}
      <div className="rounded-lg border border-border bg-background p-3">
        <Controller
          name="required"
          control={form.control}
          render={({ field }) => (
            <Toggle
              id="checklist-item-required"
              checked={field.value}
              onChange={field.onChange}
              label="Required"
              description="Attendees must complete this item before the event"
            />
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? 'Saving...' : 'Save item'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ChecklistItemForm;

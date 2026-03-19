import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import FormInput from '@/components/Input/form';
import FormSelect from '@/components/Select/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CHECKLIST_TYPE_LABELS, CHECKLIST_ITEM_TYPES } from '@/types/checklist';
import { checklistItemSchema, type ChecklistItemValues } from './constants';

type ChecklistItemFormProps = {
  defaultValues?: Partial<ChecklistItemValues>;
  onSubmit: (values: ChecklistItemValues) => Promise<void> | void;
  onCancel: () => void;
  isPending?: boolean;
  /** Render wrapper as <div> to avoid invalid nested <form> elements */
  asDiv?: boolean;
};

const typeOptions = CHECKLIST_ITEM_TYPES.map((value) => ({
  value,
  label: CHECKLIST_TYPE_LABELS[value],
}));

const ChecklistItemForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending = false,
  asDiv = false,
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

  const Wrapper = asDiv ? 'div' : 'form';
  const wrapperProps = asDiv
    ? {}
    : { onSubmit: form.handleSubmit(onSubmit) };

  return (
    <FormProvider {...form}>
      <Wrapper
        {...wrapperProps}
        className="space-y-4 rounded-xl border border-border bg-muted/30 p-4"
      >
        <FormInput
          name="name"
          label="Item name"
          placeholder="e.g. Upload passport, Confirm dietary restrictions"
          required
        />

        <FormSelect name="type" label="Type" options={typeOptions} />

        {/* Required toggle */}
        <div className="rounded-lg border border-border bg-background p-3">
          <Controller
            name="required"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="checklist-item-required" className="cursor-pointer">
                    Required
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Attendees must complete this item before the event
                  </p>
                </div>
                <Switch
                  id="checklist-item-required"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type={asDiv ? 'button' : 'submit'}
            onClick={asDiv ? form.handleSubmit(onSubmit) : undefined}
            disabled={isPending}
            size="sm"
          >
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
      </Wrapper>
    </FormProvider>
  );
};

export default ChecklistItemForm;

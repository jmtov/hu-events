import { Controller, useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/** Props for the FormTextarea component. */
type FormTextareaProps = {
  /** Field name — must match a key in the form schema. */
  name: string;
  /** Textarea label text. */
  label: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Marks the field as required with a visual indicator. */
  required?: boolean;
  /** Hint text displayed below the textarea when there is no error. */
  hint?: string;
  /** Called when the field loses focus, after react-hook-form's own onBlur. */
  onBlur?: () => void;
  rows?: number;
  /** Disables the textarea. */
  disabled?: boolean;
};

/**
 * Form-connected Textarea. Must be used inside `<FormProvider>`.
 * Supports an extra `onBlur` callback for triggering side effects
 * (e.g. AI suggestions) without blocking the form.
 *
 * @example
 * <FormProvider {...form}>
 *   <FormTextarea name="description" label="Description" onBlur={handleAiDetect} />
 * </FormProvider>
 */
const FormTextarea = ({
  name,
  label,
  placeholder,
  required,
  hint,
  onBlur: onBlurProp,
  rows = 4,
  disabled,
}: FormTextareaProps) => {
  const { control, formState } = useFormContext();
  const error = formState.errors[name]?.message as string | undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            id={name}
            placeholder={placeholder}
            rows={rows}
            value={field.value}
            onChange={field.onChange}
            disabled={disabled}
            onBlur={() => {
              field.onBlur();
              onBlurProp?.();
            }}
          />
        )}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
};

export default FormTextarea;

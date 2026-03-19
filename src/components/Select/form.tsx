import { Controller, useFormContext } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Option = {
  value: string
  label: string
}

/** Props for the FormSelect component. */
type FormSelectProps = {
  /** Field name — must match a key in the form schema. */
  name: string
  /** Select label text. */
  label: string
  /** List of options to render. */
  options: Option[]
  /** Placeholder shown when no option is selected. */
  placeholder?: string
  /** Marks the field as required with a visual indicator. */
  required?: boolean
  /** Hint text displayed below the select when there is no error. */
  hint?: string
}

/**
 * Form-connected Select. Must be used inside `<FormProvider>`.
 * Wires up Controller + validation errors automatically.
 *
 * @example
 * <FormProvider {...form}>
 *   <FormSelect name="size" label="Size" options={[{ value: 'M', label: 'M' }]} />
 * </FormProvider>
 */
const FormSelect = ({ name, label, options, placeholder, required, hint }: FormSelectProps) => {
  const { control, formState } = useFormContext()
  const error = formState.errors[name]?.message as string | undefined

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
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export default FormSelect

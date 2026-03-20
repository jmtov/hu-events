import { Controller, useFormContext } from 'react-hook-form';
import Input from './index';

type FormInputProps = {
  /** Field name — must match a key in the form schema. */
  name: string;
  /** Input label text. */
  label: string;
  /** Input type attribute. */
  type?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Marks the field as required with a visual indicator. */
  required?: boolean;
  /** Hint text displayed below the input when there is no error. */
  hint?: string;
  /** Disables the input. */
  disabled?: boolean;
};

/**
 * Form-connected Input. Must be used inside `<FormProvider>`.
 * Wires up Controller + validation errors automatically.
 *
 * @example
 * <FormProvider {...form}>
 *   <FormInput name="email" label="E-mail" type="email" required />
 * </FormProvider>
 */
const FormInput = ({
  name,
  label,
  type,
  placeholder,
  required,
  hint,
  disabled,
}: FormInputProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Input
          id={name}
          label={label}
          type={type}
          placeholder={placeholder}
          required={required}
          value={field.value}
          onBlur={field.onBlur}
          onChange={field.onChange}
          error={fieldState.error?.message}
          hint={hint}
          disabled={disabled}
        />
      )}
    />
  );
};

export default FormInput;

import { Input as ShadcnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Props for the Input component. */
type InputProps = {
  /** Input label text. */
  label?: string;
  /** Input type attribute. */
  type?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Controlled value. */
  value?: string;
  /** Called when the value changes. */
  onChange?: (value: string) => void;
  /** Called when the input loses focus. */
  onBlur?: () => void;
  /** Error message to display below the input. */
  error?: string;
  /** Hint text displayed below the input when there is no error. */
  hint?: string;
  /** Marks the field as required with a visual indicator. */
  required?: boolean;
  /** HTML id for the input element. */
  id?: string;
  /** Disables the input. */
  disabled?: boolean;
};

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required,
  id,
  disabled,
}: InputProps) => (
  <div className="space-y-1.5">
    {label && (
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
    )}
    <ShadcnInput
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onBlur={onBlur}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
    {error ? (
      <p className="text-xs text-destructive">{error}</p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

export default Input;

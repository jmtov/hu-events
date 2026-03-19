import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import FormInput from '@/components/Input/form';
import { Button } from '@/components/ui/button';
import { contactItemSchema, type ContactItemValues } from './constants';

type ContactItemFormProps = {
  defaultValues?: Partial<ContactItemValues>;
  onSubmit: (values: ContactItemValues) => Promise<void> | void;
  onCancel: () => void;
  isPending?: boolean;
  /** Render wrapper as <div> to avoid invalid nested <form> elements */
  asDiv?: boolean;
};

const ContactItemForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending = false,
  asDiv = false,
}: ContactItemFormProps) => {
  const form = useForm<ContactItemValues>({
    resolver: zodResolver(contactItemSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
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
        className="space-y-3 rounded-xl border border-border bg-muted/30 p-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            name="name"
            label="Name"
            placeholder="e.g. Maria Torres"
            required
          />
          <FormInput
            name="role"
            label="Role"
            placeholder="e.g. HR Lead"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="e.g. maria@company.com"
            required
          />
          <FormInput
            name="phone"
            label="Phone / WhatsApp"
            placeholder="e.g. +54 11 9999 0001"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Button
            type={asDiv ? 'button' : 'submit'}
            onClick={asDiv ? form.handleSubmit(onSubmit) : undefined}
            disabled={isPending}
            size="sm"
          >
            {isPending ? 'Saving...' : 'Save contact'}
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

export default ContactItemForm;

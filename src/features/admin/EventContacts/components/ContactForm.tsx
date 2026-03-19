import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormInput from '@/components/Input/form';
import { Button } from '@/components/ui/button';
import { contactSchema, type ContactFormValues } from '../constants';

type ContactFormProps = {
  defaultValues?: Partial<ContactFormValues>;
  onSubmit: (values: ContactFormValues) => Promise<void> | void;
  onCancel: () => void;
  isPending?: boolean;
};

const ContactForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isPending = false,
}: ContactFormProps) => {
  const { t } = useTranslation('admin');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      role: '',
      email: '',
      phone: '',
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...form}>
      <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            name="name"
            label={t('events.contacts.form.name')}
            placeholder={t('events.contacts.form.namePlaceholder')}
            required
          />
          <FormInput
            name="role"
            label={t('events.contacts.form.role')}
            placeholder={t('events.contacts.form.rolePlaceholder')}
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            name="email"
            label={t('events.contacts.form.email')}
            placeholder={t('events.contacts.form.emailPlaceholder')}
            type="email"
            required
          />
          <FormInput
            name="phone"
            label={t('events.contacts.form.phone')}
            placeholder={t('events.contacts.form.phonePlaceholder')}
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? t('common.saving') : t('events.contacts.form.save')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
};

export default ContactForm;

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormInput from '@/components/Input/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUpdateMyProfile } from '@/hooks/useUpdateMyProfile';
import { attendeeRegistrationSchema } from './constants';
import type { AttendeeRegistrationValues } from './types';

type AttendeeRegistrationFormProps = {
  participantId: string;
  onSuccess: () => void;
};

const AttendeeRegistrationForm = ({
  participantId,
  onSuccess,
}: AttendeeRegistrationFormProps) => {
  const { t } = useTranslation(['attendee', 'common']);
  const [submitted, setSubmitted] = useState(false);
  const updateProfile = useUpdateMyProfile(participantId);

  const form = useForm<AttendeeRegistrationValues>({
    resolver: zodResolver(attendeeRegistrationSchema()),
    defaultValues: { fullName: '', email: '', dietary: '' },
  });

  const onSubmit = async (values: AttendeeRegistrationValues) => {
    await updateProfile.mutateAsync(values);
    setSubmitted(true);
    onSuccess();
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-6 space-y-2">
            <h2 className="text-xl font-bold">
              {t('attendee:registration.success.title')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {t('attendee:registration.success.message')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-foreground text-background rounded-xl px-4 py-2">
            <span className="font-bold text-base">{t('common:brand')}</span>
          </div>
          <h1 className="text-xl font-bold">
            {t('attendee:registration.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('attendee:registration.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader className="sr-only">
            <CardTitle>{t('attendee:registration.title')}</CardTitle>
            <CardDescription>
              {t('attendee:registration.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {updateProfile.isError && (
                  <p className="text-sm text-destructive">
                    {updateProfile.error instanceof Error
                      ? updateProfile.error.message
                      : t('common:errors.generic')}
                  </p>
                )}

                <FormInput
                  name="fullName"
                  label={t('attendee:registration.fields.fullName.label')}
                  placeholder={t(
                    'attendee:registration.fields.fullName.placeholder',
                  )}
                  required
                />
                <FormInput
                  name="email"
                  label={t('attendee:registration.fields.email.label')}
                  type="email"
                  placeholder={t(
                    'attendee:registration.fields.email.placeholder',
                  )}
                  required
                />
                <FormInput
                  name="dietary"
                  label={t('attendee:registration.fields.dietary.label')}
                  placeholder={t(
                    'attendee:registration.fields.dietary.placeholder',
                  )}
                  hint={t('attendee:registration.fields.dietary.hint')}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? t('attendee:registration.submitting')
                    : t('attendee:registration.submit')}
                </Button>
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          {t('common:footer')}
        </p>
      </div>
    </div>
  );
};

export default AttendeeRegistrationForm;

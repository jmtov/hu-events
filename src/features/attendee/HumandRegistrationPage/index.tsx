import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useRouter } from '@tanstack/react-router';
import { useAttendanceAction } from '@/hooks/useAttendanceAction';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import FormInput from '@/components/Input/form';
import FormSelect from '@/components/Select/form';
import { useGetEvent } from '@/hooks/useGetEvent';
import { useGetPreferenceFields } from '@/hooks/useGetPreferenceFields';
import { registrationSchema } from './constants';
import type { RegistrationValues } from './types';
import EventHeader from './components/EventHeader';
import SuccessScreen from './components/SuccessScreen';

type HumandRegistrationPageProps = {
  eventId: string;
};

const HumandRegistrationPage = ({ eventId }: HumandRegistrationPageProps) => {
  const { t } = useTranslation('attendee');
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);
  const { data: preferenceFields = [], isLoading: fieldsLoading } =
    useGetPreferenceFields(eventId);
  const attendanceMutation = useAttendanceAction(eventId);

  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      city: '',
      region: '',
      country: '',
      role: '',
      preferences: {},
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    setSubmitError(false);
    attendanceMutation.mutate(
      {
        email: values.email,
        full_name: values.fullName,
        location_city: values.city,
        location_region: values.region,
        location_country: values.country,
        role: values.role || undefined,
      },
      {
        onSuccess: () => {
          sessionStorage.setItem('humand_attendee_email', values.email);
          router.navigate({
            to: '/attendee/events/$eventId',
            params: { eventId },
          });
          setSubmitted(true);
        },
        onError: () => setSubmitError(true),
      },
    );
  });

  const handleBack = () => {
    form.reset();
    setSubmitted(false);
  };

  if (eventLoading || fieldsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          {t('common.eventNotFound')}
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="mx-auto max-w-xl">
          <EventHeader event={event} />
          <Card>
            <CardContent className="pt-6">
              <SuccessScreen
                name={form.getValues('fullName')}
                onBack={handleBack}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <EventHeader event={event} />

        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('registration.sections.info')}
                </CardTitle>
                <CardDescription>
                  {t('registration.requiredHint')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  name="fullName"
                  label={t('registration.fields.fullName.label')}
                  placeholder="Ex: Ana Silva"
                  required
                />
                <FormInput
                  name="email"
                  label={t('registration.fields.email.label')}
                  type="email"
                  placeholder="ana@empresa.com"
                  required
                />
                <FormInput
                  name="role"
                  label={t('registration.fields.role.label')}
                  placeholder="Ex: Gerente de RH"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t('registration.sections.location')}
                </CardTitle>
                <CardDescription>
                  {t('registration.sections.locationHint')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  name="city"
                  label={t('registration.fields.city.label')}
                  placeholder="Ex: São Paulo"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    name="region"
                    label={t('registration.fields.region.label')}
                    placeholder="Ex: SP"
                    required
                  />
                  <FormInput
                    name="country"
                    label={t('registration.fields.country.label')}
                    placeholder="Ex: Brasil"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {preferenceFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('registration.sections.preferences')}
                  </CardTitle>
                  <CardDescription>
                    {t('registration.sections.preferencesHint')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {preferenceFields.map((field, i) => (
                    <div key={field.id}>
                      {i > 0 && <Separator className="mb-4" />}
                      {field.field_type === 'select' && field.options ? (
                        <FormSelect
                          name={`preferences.${field.id}`}
                          label={field.label}
                          options={field.options.map((o) => ({
                            value: o,
                            label: o,
                          }))}
                          required={field.required}
                        />
                      ) : (
                        <FormInput
                          name={`preferences.${field.id}`}
                          label={field.label}
                          placeholder={t(
                            'registration.fields.preferences.placeholder',
                          )}
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {event.modules.checklist && event.checklist && event.checklist.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t('registration.checklist.title')}
                  </CardTitle>
                  <CardDescription>
                    {t('registration.checklist.subtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.checklist.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-foreground">{item.label}</span>
                        <div className="flex shrink-0 gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {t(`registration.checklist.type.${item.item_type}`)}
                          </Badge>
                          {item.required && (
                            <Badge variant="outline" className="text-xs">
                              {t('registration.checklist.required')}
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {submitError && (
              <p className="text-sm text-destructive">{t('registration.submitError')}</p>
            )}
            <Button type="submit" className="w-full" disabled={attendanceMutation.isPending}>
              {attendanceMutation.isPending
                ? t('registration.submitting')
                : t('registration.submit')}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default HumandRegistrationPage;

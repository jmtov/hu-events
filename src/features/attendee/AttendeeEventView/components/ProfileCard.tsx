import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormInput from '@/components/Input/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { attendanceService, type ParticipantProfile } from '@/services/attendance';
import { profileSchema, type ProfileFormValues } from '../constants';

type ProfileCardProps = {
  participant: ParticipantProfile;
  eventId: string;
  email: string;
};

const ProfileCard = ({ participant, eventId, email }: ProfileCardProps) => {
  const { t } = useTranslation('attendee');
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      city: participant.location_city ?? '',
      region: participant.location_region ?? '',
      country: participant.location_country ?? '',
    },
  });

  // Open edit mode automatically if location is incomplete
  useEffect(() => {
    const { location_city, location_region, location_country } = participant;
    if (!location_city || !location_region || !location_country) {
      setEditing(true);
    }
  }, [participant.location_city, participant.location_region, participant.location_country]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      attendanceService.profile(eventId, {
        email,
        full_name: participant.full_name,
        location_city: values.city,
        location_region: values.region,
        location_country: values.country,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant', eventId] });
      setEditing(false);
    },
  });

  const handleCancel = () => {
    form.reset({
      city: participant.location_city ?? '',
      region: participant.location_region ?? '',
      country: participant.location_country ?? '',
    });
    setEditing(false);
  };

  return (
    <Card
      className="animate-appear-from-bottom"
      style={{ animationDelay: 'calc(2 * 50ms)' }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t('eventView.profile.title')}
          </CardTitle>
          {!editing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setEditing(true)}
            >
              {t('eventView.profile.edit')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {t('eventView.profile.name')}
            </dt>
            <dd className="font-medium text-foreground">
              {participant.full_name}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {t('eventView.profile.email')}
            </dt>
            <dd className="font-medium text-foreground">{participant.email}</dd>
          </div>

          {!editing &&
            [
              {
                label: t('eventView.profile.city'),
                value: participant.location_city,
              },
              {
                label: t('eventView.profile.region'),
                value: participant.location_region,
              },
              {
                label: t('eventView.profile.country'),
                value: participant.location_country,
              },
            ]
              .filter((row) => !!row.value)
              .map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
        </dl>

        {editing && (
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="mt-4 space-y-3 border-t pt-4"
            >
              <FormInput
                name="city"
                label={t('registration.fields.city.label')}
                disabled={mutation.isPending}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  name="region"
                  label={t('registration.fields.region.label')}
                  disabled={mutation.isPending}
                />
                <FormInput
                  name="country"
                  label={t('registration.fields.country.label')}
                  disabled={mutation.isPending}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={mutation.isPending}
                >
                  {t('eventView.profile.cancel')}
                </Button>
                <Button type="submit" size="sm" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? t('eventView.profile.saving')
                    : t('eventView.profile.save')}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;

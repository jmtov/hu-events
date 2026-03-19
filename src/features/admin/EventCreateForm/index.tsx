import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormInput from '@/components/Input/form';
import FormSelect from '@/components/Select/form';
import FormTextarea from '@/components/Textarea/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { useDetectEventType } from '@/hooks/useDetectEventType';
import { EVENT_TYPES } from '@/types/event';
import { eventCreateSchema } from './constants';
import type { EventCreateValues } from './types';

const EventCreateForm = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const createEvent = useCreateEvent();
  const detectEventType = useDetectEventType();

  const form = useForm<EventCreateValues>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      event_type: 'other',
      date_start: '',
      date_end: '',
      location: '',
    },
  });

  // Called on description blur — non-blocking AI suggestion
  const handleDetectEventType = () => {
    const description = form.getValues('description');
    if (!description.trim()) return;

    detectEventType.mutate(description, {
      onSuccess: (result) => {
        // Only apply suggestion if admin hasn't manually changed the field
        if (form.getValues('event_type') === 'other') {
          const suggested = EVENT_TYPES.find((t) => t === result.event_type);
          if (suggested)
            form.setValue('event_type', suggested, { shouldValidate: true });
        }
      },
    });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const event = await createEvent.mutateAsync({
      title: values.title,
      description: values.description,
      event_type: values.event_type,
      date_start: values.date_start,
      date_end: values.date_end || undefined,
      location: values.location || undefined,
    });
    navigate({ to: '/admin/events/$eventId', params: { eventId: event.id } });
  });

  const eventTypeOptions = EVENT_TYPES.map((type) => ({
    value: type,
    label: t(`eventTypes.${type}`),
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          {t('events.create.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('events.create.subtitle')}
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('events.create.sections.basics')}
              </CardTitle>
              <CardDescription>
                {t('events.create.requiredHint')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormInput
                name="title"
                label={t('events.create.fields.title.label')}
                placeholder={t('events.create.fields.title.placeholder')}
                required
              />
              <FormTextarea
                name="description"
                label={t('events.create.fields.description.label')}
                placeholder={t('events.create.fields.description.placeholder')}
                hint={
                  detectEventType.isPending
                    ? t('events.create.fields.description.analyzing')
                    : t('events.create.fields.description.hint')
                }
                onBlur={handleDetectEventType}
                required
              />
              <FormSelect
                name="event_type"
                label={t('events.create.fields.eventType.label')}
                options={eventTypeOptions}
                hint={
                  detectEventType.isPending
                    ? t('events.create.fields.eventType.detecting')
                    : detectEventType.isSuccess
                      ? t('events.create.fields.eventType.suggested')
                      : undefined
                }
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('events.create.sections.schedule')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  name="date_start"
                  label={t('events.create.fields.dateStart.label')}
                  type="datetime-local"
                  required
                />
                <FormInput
                  name="date_end"
                  label={t('events.create.fields.dateEnd.label')}
                  type="datetime-local"
                />
              </div>
              <FormInput
                name="location"
                label={t('events.create.fields.location.label')}
                placeholder={t('events.create.fields.location.placeholder')}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/' })}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending
                ? t('common.saving')
                : t('events.create.submit')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EventCreateForm;

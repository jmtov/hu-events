import { IconSparkles } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormInput from '@/components/Input/form';

import FormTextarea from '@/components/Textarea/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { useDetectEventType } from '@/hooks/useDetectEventType';
import { useGenerateChecklist } from '@/hooks/useGenerateChecklist';
import { checklistService } from '@/services/checklist';
import type { ChecklistItemValues } from '@/features/checklist/constants';
import { normaliseChecklistType } from '@/types/checklist';

import ChecklistItemForm from '@/features/checklist/ChecklistItemForm';
import DraftItemRow, { type DraftItem } from './components/DraftItemRow';
import { eventCreateSchema } from './constants';
import type { EventCreateValues } from './types';

const EventCreateForm = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const createEvent = useCreateEvent();
  const detectEventType = useDetectEventType();
  const generateChecklist = useGenerateChecklist();

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

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

    // Always fire a new detection — the hint text shows the pending state,
    // so we don't need to clear the field (clearing it would fail validation
    // if the user submits before the AI responds)
    detectEventType.mutate(description, {
      onSuccess: (result) => {
        if (result.event_type) {
          form.setValue('event_type', result.event_type, { shouldValidate: true });
        }
      },
    });
  };

  const handleGenerateAI = async () => {
    const description = form.getValues('description');
    if (!description.trim()) return;
    setAiError(null);

    try {
      const result = await generateChecklist.mutateAsync({
        description,
        eventType: form.getValues('event_type'),
      });

      const newItems: DraftItem[] = result.items.map((s) => ({
        _key: `${Date.now()}_${Math.random()}`,
        name: s.name,
        type: normaliseChecklistType(s.type),
        required: s.suggestedRequired,
      }));

      setDraftItems((prev) => [...prev, ...newItems]);
    } catch {
      setAiError('Could not generate suggestions. Please try again.');
    }
  };

  const handleAddItem = (values: ChecklistItemValues) => {
    setDraftItems((prev) => [
      ...prev,
      { ...values, _key: `${Date.now()}_${Math.random()}` },
    ]);
    setIsAddingItem(false);
  };

  const handleUpdateItem = (key: string, values: ChecklistItemValues) => {
    setDraftItems((prev) =>
      prev.map((item) => (item._key === key ? { ...values, _key: key } : item)),
    );
    setEditingKey(null);
  };

  const handleDeleteItem = (key: string) => {
    setDraftItems((prev) => prev.filter((item) => item._key !== key));
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

    // Save checklist items — failures are non-blocking so navigation always happens
    for (const item of draftItems) {
      try {
        await checklistService.addItem(event.id, {
          name: item.name,
          type: item.type,
          required: item.required,
        });
      } catch {
        // Item will be editable on the checklist page after redirect
      }
    }

    navigate({ to: '/admin/events/$eventId', params: { eventId: event.id } });
  });

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
          {/* Basics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('events.create.sections.basics')}
              </CardTitle>
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
              <FormInput
                name="event_type"
                label={t('events.create.fields.eventType.label')}
                placeholder={
                  detectEventType.isPending
                    ? t('events.create.fields.eventType.detecting')
                    : t('events.create.fields.eventType.placeholder')
                }
                hint={
                  detectEventType.isSuccess
                    ? t('events.create.fields.eventType.suggested')
                    : undefined
                }
                required
              />
            </CardContent>
          </Card>

          {/* Schedule */}
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

          {/* Checklist */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">Pre-event checklist</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateAI}
                  disabled={generateChecklist.isPending}
                >
                  <IconSparkles size={14} />
                  {generateChecklist.isPending
                    ? 'Generating...'
                    : 'Generate with AI'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Define tasks and documents attendees must complete before the
                event. You can add more after creating the event.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiError && (
                <p className="text-sm text-destructive">{aiError}</p>
              )}

              {draftItems.length === 0 && !isAddingItem && (
                <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No items yet. Add one below or generate suggestions with AI.
                  </p>
                </div>
              )}

              {draftItems.map((item) =>
                editingKey === item._key ? (
                  <ChecklistItemForm
                    key={item._key}
                    defaultValues={item}
                    onSubmit={(values) => handleUpdateItem(item._key, values)}
                    onCancel={() => setEditingKey(null)}
                    asDiv
                  />
                ) : (
                  <DraftItemRow
                    key={item._key}
                    item={item}
                    onEdit={() => setEditingKey(item._key)}
                    onDelete={() => handleDeleteItem(item._key)}
                  />
                ),
              )}

              {isAddingItem ? (
                <ChecklistItemForm
                  onSubmit={handleAddItem}
                  onCancel={() => setIsAddingItem(false)}
                  asDiv
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingItem(true)}
                >
                  + Add item
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
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

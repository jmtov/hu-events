import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormInput from '@/components/Input/form';
import FormTextarea from '@/components/Textarea/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { useDetectEventType } from '@/hooks/useDetectEventType';
import { useGenerateChecklist } from '@/hooks/useGenerateChecklist';
import { checklistService } from '@/services/checklist';
import { participantService } from '@/services/participants';
import { normaliseChecklistType } from '@/types/checklist';
import type { ChecklistSuggestion } from '@/types/checklist';
import type { EventModules } from '@/types/event';
import ModuleToggleRow from './components/ModuleToggleRow';
import ChecklistModule from './components/ChecklistModule';
import ParticipantModule from './components/ParticipantModule';
import type { ChecklistItemValues } from './components/ChecklistModule/constants';
import type { DraftItem } from './components/ChecklistModule/DraftItemRow';
import { DEFAULT_MODULES, eventConfigSchema } from './constants';
import type { EventConfigValues } from './types';

const EventConfigForm = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const createEvent = useCreateEvent();
  const detectEventType = useDetectEventType();
  const generateChecklist = useGenerateChecklist();

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [modules, setModules] = useState<EventModules>({ ...DEFAULT_MODULES });
  const [draftEmails, setDraftEmails] = useState<string[]>([]);

  const MODULE_KEYS = Object.keys(DEFAULT_MODULES) as Array<keyof EventModules>;

  const form = useForm<EventConfigValues>({
    resolver: zodResolver(eventConfigSchema),
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

      const newItems: DraftItem[] = result.items.map((s: ChecklistSuggestion) => ({
        _key: `${Date.now()}_${Math.random()}`,
        name: s.name,
        type: normaliseChecklistType(s.type),
        required: s.suggestedRequired,
      }));

      setDraftItems((prev) => [...prev, ...newItems]);
    } catch {
      setAiError(t('events.create.checklist.aiError'));
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
      modules,
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

    // Save participant emails — failures are non-blocking
    if (modules.participantList) {
      for (const email of draftEmails) {
        try {
          await participantService.add(event.id, { email });
        } catch {
          // Participant can be added from the participants page after redirect
        }
      }
    }

    navigate({
      to: '/admin/events/$eventId',
      params: { eventId: event.id },
      search: { created: true },
    });
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 animate-appear-from-bottom space-y-1">
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
          <Card
            className="animate-appear-from-bottom"
            style={{ animationDelay: 'calc(1 * 50ms)' }}
          >
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
          <Card
            className="animate-appear-from-bottom"
            style={{ animationDelay: 'calc(2 * 50ms)' }}
          >
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

          {/* Modules */}
          {MODULE_KEYS.map((key, index) => (
            <ModuleToggleRow
              key={key}
              id={key}
              style={{ animationDelay: `calc(${index + 3} * 50ms)` }}
              label={t(`events.modules.${key}.label`)}
              description={t(`events.modules.${key}.description`)}
              enabled={modules[key]}
              onToggle={(value) =>
                setModules((prev) => ({ ...prev, [key]: value }))
              }
            >
              {key === 'checklist' && (
                <ChecklistModule
                  draftItems={draftItems}
                  isAddingItem={isAddingItem}
                  editingKey={editingKey}
                  aiError={aiError}
                  isGenerating={generateChecklist.isPending}
                  onGenerateAI={handleGenerateAI}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  onSetAddingItem={setIsAddingItem}
                  onSetEditingKey={setEditingKey}
                />
              )}
              {key === 'participantList' && (
                <ParticipantModule
                  emails={draftEmails}
                  onAdd={(email) => setDraftEmails((prev) => [...prev, email])}
                  onRemove={(email) =>
                    setDraftEmails((prev) => prev.filter((e) => e !== email))
                  }
                />
              )}
            </ModuleToggleRow>
          ))}

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

export default EventConfigForm;

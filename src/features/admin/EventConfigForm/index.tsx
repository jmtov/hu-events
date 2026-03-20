import { zodResolver } from '@hookform/resolvers/zod';
import { IconSparkles } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormInput from '@/components/Input/form';
import FormSelect from '@/components/Select/form';
import FormTextarea from '@/components/Textarea/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateEvent } from '@/hooks/useCreateEvent';
import { useSuggestEvent } from '@/hooks/useSuggestEvent';
import type { BudgetCategory, BudgetCategoryKey } from '@/types/budget';
import { normaliseChecklistType } from '@/types/checklist';
import type { EventModules } from '@/types/event';
import AILoadingBar from './components/AILoadingBar';
import BudgetModule from './components/BudgetModule';
import { DEFAULT_BUDGET_CATEGORIES } from './components/BudgetModule/constants';
import ChecklistModule from './components/ChecklistModule';
import type { ChecklistItemValues } from './components/ChecklistModule/constants';
import type { DraftItem } from './components/ChecklistModule/DraftItemRow';
import ContactsModule from './components/ContactsModule';
import type { ContactItemValues } from './components/ContactsModule/constants';
import type { DraftContact } from './components/ContactsModule/DraftContactRow';
import ModuleToggleRow from './components/ModuleToggleRow';
import NotificationsModule from './components/NotificationsModule';
import {
  DEFAULT_CHECKLIST_TRIGGER,
  DEFAULT_DRAFT_TRIGGERS,
  type DraftTrigger,
} from './components/NotificationsModule/constants';
import ParticipantModule from './components/ParticipantModule';
import { DEFAULT_MODULES, EVENT_TYPE_OPTIONS, EVENT_TYPES, eventConfigSchema } from './constants';
import type { EventType } from './constants';
import type { EventConfigValues } from './types';

const EventConfigForm = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const createEvent = useCreateEvent();
  const suggestEvent = useSuggestEvent();

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [modules, setModules] = useState<EventModules>({ ...DEFAULT_MODULES });
  const [draftEmails, setDraftEmails] = useState<string[]>([]);
  const [draftTriggers, setDraftTriggers] = useState<DraftTrigger[]>(
    DEFAULT_DRAFT_TRIGGERS.map((t) => ({ ...t })),
  );
  const [draftBudgetCategories, setDraftBudgetCategories] = useState<BudgetCategory[]>(
    DEFAULT_BUDGET_CATEGORIES,
  );

  const [draftContacts, setDraftContacts] = useState<DraftContact[]>([]);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactKey, setEditingContactKey] = useState<string | null>(null);

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
      expected_attendees: '',
    },
  });

  const handleSuggestWithAI = () => {
    const title = form.getValues('title');
    const description = form.getValues('description');
    if (!title.trim() || !description.trim()) return;
    setSuggestError(null);

    suggestEvent.mutate({ title, description }, {
      onSuccess: (result) => {
        const suggestedType = result.event_type as string
        const mappedType: EventType = (EVENT_TYPES as readonly string[]).includes(suggestedType)
          ? (suggestedType as EventType)
          : 'other'
        form.setValue('event_type', mappedType, { shouldValidate: true });

        if (result.date_start) {
          form.setValue('date_start', `${result.date_start}T00:00`, { shouldValidate: true });
        }
        if (result.date_end) {
          form.setValue('date_end', `${result.date_end}T00:00`, { shouldValidate: true });
        }
        if (result.location) {
          form.setValue('location', result.location, { shouldValidate: true });
        }
        if (result.expected_attendees !== null) {
          form.setValue('expected_attendees', String(result.expected_attendees), { shouldValidate: true });
        }

        const hasChecklist = result.checklist.length > 0;
        let hasRequiredItems = false;

        if (hasChecklist) {
          const newItems: DraftItem[] = result.checklist.map((s) => ({
            _key: `${Date.now()}_${Math.random()}`,
            name: s.name,
            type: normaliseChecklistType(s.type),
            required: s.suggestedRequired,
          }));
          setDraftItems(newItems);

          const requiredTriggers = newItems
            .filter((item) => item.required)
            .map((item) => ({
              name: item.name,
              source: 'checklist' as const,
              ...DEFAULT_CHECKLIST_TRIGGER,
            }));
          hasRequiredItems = requiredTriggers.length > 0;
          if (hasRequiredItems) {
            setDraftTriggers((prev) => [
              ...requiredTriggers,
              ...prev.filter((t) => t.source !== 'checklist'),
            ]);
          }
        }

        const estimates = result.budget_estimates;
        const hasEstimates = Object.values(estimates).some((v) => v > 0);
        if (hasEstimates) {
          setDraftBudgetCategories((prev) =>
            prev.map((cat) => {
              const estimate = estimates[cat.key as BudgetCategoryKey];
              if (estimate !== undefined && estimate > 0) {
                return { ...cat, ai_estimate: estimate, cap: estimate, enabled: true };
              }
              return cat;
            }),
          );
        }

        setModules((prev) => ({
          ...prev,
          checklist: hasChecklist,
          budget: hasEstimates,
          notifications: hasRequiredItems,
        }));
      },
      onError: () => {
        setSuggestError(t('events.create.aiError'));
      },
    });
  };

  const handleAddItem = (values: ChecklistItemValues) => {
    setDraftItems((prev) => [
      ...prev,
      { ...values, _key: `${Date.now()}_${Math.random()}` },
    ]);
    if (values.required) {
      setDraftTriggers((prev) => [
        {
          name: values.name,
          source: 'checklist',
          ...DEFAULT_CHECKLIST_TRIGGER,
        },
        ...prev,
      ]);
    }
    setIsAddingItem(false);
  };

  const handleUpdateItem = (key: string, values: ChecklistItemValues) => {
    const existing = draftItems.find((item) => item._key === key);
    setDraftItems((prev) =>
      prev.map((item) => (item._key === key ? { ...values, _key: key } : item)),
    );
    if (existing) {
      setDraftTriggers((prev) => {
        const withoutOld = prev.filter(
          (t) => t.source !== 'checklist' || t.name !== existing.name,
        );
        if (values.required) {
          return [
            {
              name: values.name,
              source: 'checklist',
              ...DEFAULT_CHECKLIST_TRIGGER,
            },
            ...withoutOld,
          ];
        }
        return withoutOld;
      });
    }
    setEditingKey(null);
  };

  const handleDeleteItem = (key: string) => {
    const item = draftItems.find((i) => i._key === key);
    setDraftItems((prev) => prev.filter((i) => i._key !== key));
    if (item?.required) {
      setDraftTriggers((prev) =>
        prev.filter((t) => t.source !== 'checklist' || t.name !== item.name),
      );
    }
  };

  const handleUpdateTrigger = (index: number, patch: Partial<DraftTrigger>) => {
    setDraftTriggers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  };

  const handleAddContact = (values: ContactItemValues) => {
    setDraftContacts((prev) => [
      ...prev,
      { ...values, _key: `${Date.now()}_${Math.random()}` },
    ]);
    setIsAddingContact(false);
  };

  const handleUpdateContact = (key: string, values: ContactItemValues) => {
    setDraftContacts((prev) =>
      prev.map((c) => (c._key === key ? { ...values, _key: key } : c)),
    );
    setEditingContactKey(null);
  };

  const handleDeleteContact = (key: string) => {
    setDraftContacts((prev) => prev.filter((c) => c._key !== key));
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const event = await createEvent.mutateAsync({
      title: values.title,
      description: values.description,
      event_type: values.event_type,
      date_start: values.date_start,
      date_end: values.date_end || undefined,
      location: values.location || undefined,
      expected_attendees: values.expected_attendees ? parseInt(values.expected_attendees, 10) : undefined,
      modules,
      participants: modules.participantList
        ? draftEmails.map((email) => ({ email }))
        : undefined,
      checklist: modules.checklist
        ? draftItems.map((item) => ({
            label: item.name,
            item_type: item.type,
            required: item.required,
            alert_if_incomplete: item.required,
          }))
        : undefined,
      triggers: modules.notifications
        ? draftTriggers.map((t) => ({
            name: t.name,
            source: t.source,
            timing: t.timing,
            timingValue: t.timingValue,
            channel: t.channel,
            recipient: t.recipient,
          }))
        : undefined,
      budget: modules.budget ? draftBudgetCategories : undefined,
      contacts: modules.contacts
        ? draftContacts.map((c) => ({
            name: c.name,
            role: c.role,
            email: c.email,
            phone: c.phone || undefined,
          }))
        : undefined,
    });

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
                disabled={suggestEvent.isPending}
              />
              <FormTextarea
                name="description"
                label={t('events.create.fields.description.label')}
                placeholder={t('events.create.fields.description.placeholder')}
                hint={t('events.create.fields.description.hint')}
                required
                disabled={suggestEvent.isPending}
              />
              <FormSelect
                name="event_type"
                label={t('events.create.fields.eventType.label')}
                options={[...EVENT_TYPE_OPTIONS]}
                placeholder={t('events.create.fields.eventType.placeholder')}
                hint={
                  suggestEvent.isSuccess
                    ? t('events.create.fields.eventType.suggested')
                    : undefined
                }
                required
              />
              <div className="flex items-center justify-between gap-4 pt-1">
                {suggestError && (
                  <p className="text-sm text-destructive">{suggestError}</p>
                )}
                <div className="ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSuggestWithAI}
                    disabled={suggestEvent.isPending}
                  >
                    <IconSparkles size={14} />
                    {suggestEvent.isPending
                      ? t('events.create.suggesting')
                      : t('events.create.suggestWithAI')}
                  </Button>
                </div>
              </div>
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
                  disabled={suggestEvent.isPending}
                />
                <FormInput
                  name="date_end"
                  label={t('events.create.fields.dateEnd.label')}
                  type="datetime-local"
                  disabled={suggestEvent.isPending}
                />
              </div>
              <FormInput
                name="location"
                label={t('events.create.fields.location.label')}
                placeholder={t('events.create.fields.location.placeholder')}
                disabled={suggestEvent.isPending}
              />
              <FormInput
                name="expected_attendees"
                label={t('events.create.fields.expectedAttendees.label')}
                placeholder={t('events.create.fields.expectedAttendees.placeholder')}
                type="number"
                disabled={suggestEvent.isPending}
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
              {key === 'budget' && (
                <BudgetModule
                  categories={draftBudgetCategories}
                  onCategoriesChange={setDraftBudgetCategories}
                />
              )}
              {key === 'notifications' && (
                <NotificationsModule
                  draftTriggers={draftTriggers}
                  onUpdateTrigger={handleUpdateTrigger}
                />
              )}

              {key === 'contacts' && (
                <ContactsModule
                  draftContacts={draftContacts}
                  isAddingContact={isAddingContact}
                  editingKey={editingContactKey}
                  onAddContact={handleAddContact}
                  onUpdateContact={handleUpdateContact}
                  onDeleteContact={handleDeleteContact}
                  onSetAddingContact={setIsAddingContact}
                  onSetEditingKey={setEditingContactKey}
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

      <AILoadingBar visible={suggestEvent.isPending} />
    </div>
  );
};

export default EventConfigForm;

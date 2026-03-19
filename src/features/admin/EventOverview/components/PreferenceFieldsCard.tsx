import { useState } from 'react';
import { IconPencil, IconSparkles, IconTrash } from '@tabler/icons-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import FormInput from '@/components/Input/form';
import FormSelect from '@/components/Select/form';
import { useGetPreferenceFields } from '@/hooks/useGetPreferenceFields';
import { useAddPreferenceField } from '@/hooks/useAddPreferenceField';
import { useUpdatePreferenceField } from '@/hooks/useUpdatePreferenceField';
import { useDeletePreferenceField } from '@/hooks/useDeletePreferenceField';
import { useSuggestPreferenceFields } from '@/hooks/useSuggestPreferenceFields';
import type { PreferenceField, PreferenceFieldSuggestion } from '@/types/participant';
import { normaliseSuggestionType } from '@/types/participant';
import type { Event } from '@/types/event';
import { z } from 'zod';

// ─── Local schema (mirrors PreferenceFieldsModule/constants.ts) ───────────────

const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Texto livre' },
  { value: 'select', label: 'Seleção' },
  { value: 'boolean', label: 'Sim / Não' },
] as const;

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Texto',
  select: 'Seleção',
  boolean: 'Sim / Não',
};

const FIELD_TYPE_COLORS: Record<string, string> = {
  text: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  select: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  boolean: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

const fieldSchema = z
  .object({
    label: z.string().min(1, 'O nome do campo é obrigatório'),
    field_type: z.enum(['text', 'select', 'boolean']),
    options_raw: z.string().optional(),
    required: z.boolean(),
  })
  .refine(
    (d) => d.field_type !== 'select' || (d.options_raw?.trim() ?? '').length > 0,
    { message: 'Informe ao menos uma opção', path: ['options_raw'] },
  );

type FieldFormValues = z.infer<typeof fieldSchema>;

// ─── Inline field form ────────────────────────────────────────────────────────

type FieldFormProps = {
  defaultValues?: Partial<FieldFormValues>;
  onSubmit: (values: FieldFormValues) => Promise<void> | void;
  onCancel: () => void;
  isPending?: boolean;
};

const FieldForm = ({ defaultValues, onSubmit, onCancel, isPending = false }: FieldFormProps) => {
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: { label: '', field_type: 'text', options_raw: '', required: false, ...defaultValues },
  });

  const fieldType = useWatch({ control: form.control, name: 'field_type' });

  return (
    <FormProvider {...form}>
      <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
        <FormInput name="label" label="Nome do campo" placeholder="Ex: Restrições alimentares" required />
        <FormSelect
          name="field_type"
          label="Tipo de resposta"
          options={FIELD_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        {fieldType === 'select' && (
          <Controller
            name="options_raw"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label htmlFor="pfc-options">
                  Opções <span className="text-destructive">*</span>
                </Label>
                <input
                  id="pfc-options"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Ex: S, M, L, XL"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
                {fieldState.error ? (
                  <p className="text-xs text-destructive">{fieldState.error.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Separe as opções por vírgula</p>
                )}
              </div>
            )}
          />
        )}
        <div className="rounded-lg border border-border bg-background p-3">
          <Controller
            name="required"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="pfc-required" className="cursor-pointer">Obrigatório</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Participantes devem preencher este campo no onboarding
                  </p>
                </div>
                <Switch id="pfc-required" checked={field.value} onCheckedChange={field.onChange} />
              </div>
            )}
          />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button type="button" size="sm" disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
            {isPending ? 'Salvando...' : 'Salvar campo'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        </div>
      </div>
    </FormProvider>
  );
};

// ─── Saved field row ──────────────────────────────────────────────────────────

type SavedFieldRowProps = {
  field: PreferenceField;
  onEdit: () => void;
  onDelete: () => void;
};

const SavedFieldRow = ({ field, onEdit, onDelete }: SavedFieldRowProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-center gap-3">
        <span className="truncate font-medium text-card-foreground">{field.label}</span>
        <span className={cn('inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', FIELD_TYPE_COLORS[field.field_type])}>
          {FIELD_TYPE_LABELS[field.field_type]}
        </span>
      </div>
      {field.options && field.options.length > 0 && (
        <p className="text-xs text-muted-foreground">{field.options.join(' · ')}</p>
      )}
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {field.required && <span className="text-xs text-muted-foreground">Obrigatório</span>}
      <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar campo">
        <IconPencil size={14} />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={onDelete} aria-label="Deletar campo" className="text-destructive hover:text-destructive">
        <IconTrash size={14} />
      </Button>
    </div>
  </div>
);

// ─── Suggestion card ──────────────────────────────────────────────────────────

type SuggestionCardProps = {
  suggestion: PreferenceFieldSuggestion;
  onAccept: () => void;
  onDiscard: () => void;
  isPending: boolean;
};

const SuggestionCard = ({ suggestion, onAccept, onDiscard, isPending }: SuggestionCardProps) => {
  const fieldType = normaliseSuggestionType(suggestion.inputType);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm ring-1 ring-amber-300/40">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="truncate font-medium text-card-foreground">{suggestion.label}</span>
          <span className={cn('inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset', FIELD_TYPE_COLORS[fieldType])}>
            {FIELD_TYPE_LABELS[fieldType]}
          </span>
        </div>
        {suggestion.options && suggestion.options.length > 0 && (
          <p className="text-xs text-muted-foreground">{suggestion.options.join(' · ')}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onAccept} disabled={isPending}
          className="h-7 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs">
          Aceitar
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDiscard} disabled={isPending}
          className="h-7 text-xs text-muted-foreground">
          Descartar
        </Button>
      </div>
    </div>
  );
};

// ─── Main card ────────────────────────────────────────────────────────────────

type PreferenceFieldsCardProps = {
  event: Event;
};

const PreferenceFieldsCard = ({ event }: PreferenceFieldsCardProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PreferenceFieldSuggestion[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const fieldsQuery = useGetPreferenceFields(event.id);
  const addField = useAddPreferenceField(event.id);
  const updateField = useUpdatePreferenceField(event.id);
  const deleteField = useDeletePreferenceField(event.id);
  const suggestFields = useSuggestPreferenceFields();

  const fields = fieldsQuery.data ?? [];

  const handleSuggest = () => {
    setAiError(null);
    suggestFields.mutate(
      { description: event.description, eventType: event.event_type },
      {
        onSuccess: (result) => setSuggestions(result.fields),
        onError: () => setAiError('Não foi possível gerar sugestões. Tente novamente.'),
      },
    );
  };

  const handleAccept = (suggestion: PreferenceFieldSuggestion) => {
    const fieldType = normaliseSuggestionType(suggestion.inputType);
    addField.mutate(
      {
        label: suggestion.label,
        field_type: fieldType,
        options: fieldType === 'select' ? (suggestion.options ?? []) : null,
        required: false,
      },
      { onSuccess: () => setSuggestions((prev) => prev.filter((s) => s !== suggestion)) },
    );
  };

  const handleAdd = (values: FieldFormValues) => {
    const fieldType = values.field_type;
    const options =
      fieldType === 'select'
        ? (values.options_raw ?? '').split(',').map((o) => o.trim()).filter(Boolean)
        : null;

    addField.mutate(
      { label: values.label, field_type: fieldType, options, required: values.required },
      { onSuccess: () => setIsAdding(false) },
    );
  };

  const handleUpdate = (fieldId: string, values: FieldFormValues) => {
    const fieldType = values.field_type;
    const options =
      fieldType === 'select'
        ? (values.options_raw ?? '').split(',').map((o) => o.trim()).filter(Boolean)
        : null;

    updateField.mutate(
      { fieldId, payload: { label: values.label, field_type: fieldType, options, required: values.required } },
      { onSuccess: () => setEditingId(null) },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Campos de Preferência</CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={suggestFields.isPending}
        >
          <IconSparkles size={14} />
          {suggestFields.isPending ? 'Gerando...' : 'Sugerir campos'}
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {aiError && <p className="text-sm text-destructive">{aiError}</p>}

        {/* AI suggestions */}
        {suggestions.map((s, i) => (
          <SuggestionCard
            key={`${s.label}-${i}`}
            suggestion={s}
            onAccept={() => handleAccept(s)}
            onDiscard={() => setSuggestions((prev) => prev.filter((x) => x !== s))}
            isPending={addField.isPending}
          />
        ))}

        {/* Existing saved fields */}
        {fieldsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando campos...</p>
        )}

        {fields.length === 0 && suggestions.length === 0 && !isAdding && !fieldsQuery.isLoading && (
          <div className="rounded-xl border border-dashed border-border px-6 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum campo configurado. Adicione um abaixo ou gere sugestões com IA.
            </p>
          </div>
        )}

        {fields.map((field) =>
          editingId === field.id ? (
            <FieldForm
              key={field.id}
              defaultValues={{
                label: field.label,
                field_type: field.field_type,
                options_raw: field.options?.join(', ') ?? '',
                required: field.required,
              }}
              onSubmit={(values) => handleUpdate(field.id, values)}
              onCancel={() => setEditingId(null)}
              isPending={updateField.isPending}
            />
          ) : (
            <SavedFieldRow
              key={field.id}
              field={field}
              onEdit={() => setEditingId(field.id)}
              onDelete={() => deleteField.mutate(field.id)}
            />
          ),
        )}

        {isAdding ? (
          <FieldForm
            onSubmit={handleAdd}
            onCancel={() => setIsAdding(false)}
            isPending={addField.isPending}
          />
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            + Adicionar campo
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PreferenceFieldsCard;

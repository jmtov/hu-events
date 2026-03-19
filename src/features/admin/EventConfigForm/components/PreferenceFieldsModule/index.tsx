import { useState } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useSuggestPreferenceFields } from '@/hooks/useSuggestPreferenceFields';
import type { PreferenceFieldSuggestion } from '@/types/participant';
import { normaliseSuggestionType } from '@/types/participant';
import PreferenceFieldForm from './PreferenceFieldForm';
import PreferenceFieldRow, { type DraftField } from './PreferenceFieldRow';
import SuggestedFieldCard from './SuggestedFieldCard';
import type { PreferenceFieldValues } from './constants';

type PreferenceFieldsModuleProps = {
  draftFields: DraftField[];
  isAddingField: boolean;
  editingKey: string | null;
  /** Event description — passed to Gemini for context */
  description: string;
  /** Event type — passed to Gemini for context */
  eventType: string;
  onAddField: (values: PreferenceFieldValues) => void;
  onUpdateField: (key: string, values: PreferenceFieldValues) => void;
  onDeleteField: (key: string) => void;
  onSetAddingField: (value: boolean) => void;
  onSetEditingKey: (key: string | null) => void;
};

const PreferenceFieldsModule = ({
  draftFields,
  isAddingField,
  editingKey,
  description,
  eventType,
  onAddField,
  onUpdateField,
  onDeleteField,
  onSetAddingField,
  onSetEditingKey,
}: PreferenceFieldsModuleProps) => {
  const [suggestions, setSuggestions] = useState<PreferenceFieldSuggestion[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const suggestFields = useSuggestPreferenceFields();

  const handleSuggest = () => {
    if (!description.trim()) return;
    setAiError(null);

    suggestFields.mutate(
      { description, eventType },
      {
        onSuccess: (result) => setSuggestions(result.fields),
        onError: () => setAiError('Não foi possível gerar sugestões. Tente novamente.'),
      },
    );
  };

  const handleAcceptSuggestion = (suggestion: PreferenceFieldSuggestion) => {
    const fieldType = normaliseSuggestionType(suggestion.inputType);
    const optionsRaw =
      fieldType === 'select' && suggestion.options
        ? suggestion.options.join(', ')
        : '';

    onAddField({ label: suggestion.label, field_type: fieldType, options_raw: optionsRaw, required: false });
    setSuggestions((prev) => prev.filter((s) => s !== suggestion));
  };

  const handleDiscardSuggestion = (suggestion: PreferenceFieldSuggestion) => {
    setSuggestions((prev) => prev.filter((s) => s !== suggestion));
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Defina quais informações os participantes devem preencher no onboarding.
          Você pode adicionar mais campos após criar o evento.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={suggestFields.isPending || !description.trim()}
        >
          <IconSparkles size={14} />
          {suggestFields.isPending ? 'Gerando...' : 'Sugerir campos'}
        </Button>
      </div>

      {aiError && <p className="text-sm text-destructive">{aiError}</p>}

      {/* AI suggestions */}
      {suggestions.map((suggestion, i) => (
        <SuggestedFieldCard
          key={`${suggestion.label}-${i}`}
          suggestion={suggestion}
          onAccept={() => handleAcceptSuggestion(suggestion)}
          onDiscard={() => handleDiscardSuggestion(suggestion)}
        />
      ))}

      {/* Empty state */}
      {draftFields.length === 0 && suggestions.length === 0 && !isAddingField && (
        <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum campo ainda. Adicione um abaixo ou gere sugestões com IA.
          </p>
        </div>
      )}

      {/* Saved draft fields */}
      {draftFields.map((field) =>
        editingKey === field._key ? (
          <PreferenceFieldForm
            key={field._key}
            defaultValues={field}
            onSubmit={(values) => onUpdateField(field._key, values)}
            onCancel={() => onSetEditingKey(null)}
            asDiv
          />
        ) : (
          <PreferenceFieldRow
            key={field._key}
            field={field}
            onEdit={() => onSetEditingKey(field._key)}
            onDelete={() => onDeleteField(field._key)}
          />
        ),
      )}

      {isAddingField ? (
        <PreferenceFieldForm
          onSubmit={onAddField}
          onCancel={() => onSetAddingField(false)}
          asDiv
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSetAddingField(true)}
        >
          + Adicionar campo
        </Button>
      )}
    </div>
  );
};

export default PreferenceFieldsModule;

import { IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useAddChecklistItem } from '@/hooks/useAddChecklistItem';
import { useGenerateChecklist } from '@/hooks/useGenerateChecklist';
import { useGetChecklist } from '@/hooks/useGetChecklist';
import { useGetEvent } from '@/hooks/useGetEvent';
import type { ChecklistItemValues } from '@/schemas/checklist';
import type { ChecklistItemType } from '@/types/checklist';
import ChecklistItemForm from './ChecklistItemForm';
import ChecklistItemRow from './ChecklistItemRow';

/** Maps the AI-returned 'task' type to the admin checklist 'checkbox' type. */
const normaliseType = (raw: string): ChecklistItemType => {
  if (raw === 'task') return 'checkbox';
  if (raw === 'document_upload' || raw === 'info_input') return raw;
  return 'checkbox';
};

const ChecklistPage = () => {
  const { eventId } = useParams({ from: '/admin/events/$eventId/checklist' });
  const { data: event } = useGetEvent(eventId);
  const { data: items = [], isLoading } = useGetChecklist(eventId);
  const addItem = useAddChecklistItem(eventId);
  const generateChecklist = useGenerateChecklist();

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAddItem = async (values: ChecklistItemValues) => {
    await addItem.mutateAsync(values);
    setIsAddingItem(false);
  };

  const handleGenerateAI = async () => {
    if (!event?.description) return;
    setAiError(null);

    try {
      const result = await generateChecklist.mutateAsync({
        description: event.description,
        eventType: event.eventType,
      });

      for (const suggestion of result.items) {
        await addItem.mutateAsync({
          name: suggestion.name,
          type: normaliseType(suggestion.type),
          required: suggestion.suggestedRequired,
          alertIfIncomplete: false,
        });
      }
    } catch {
      setAiError('Could not generate checklist. Please try again.');
    }
  };

  const isGenerating = generateChecklist.isPending || addItem.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Pre-event checklist</h1>
          <p className="text-sm text-muted-foreground">
            Define tasks and documents attendees must complete before the event.
            Items marked as "alert if incomplete" will create a notification
            trigger.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateAI}
          disabled={isGenerating || !event?.description}
          title={
            !event?.description
              ? 'Event description is required to generate suggestions'
              : undefined
          }
        >
          <IconSparkles size={14} />
          {isGenerating ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>

      {aiError && <p className="text-sm text-destructive">{aiError}</p>}

      {/* Item list */}
      <div className="space-y-2">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}

        {!isLoading && items.length === 0 && !isAddingItem && (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No items yet. Add one below or generate suggestions with AI.
            </p>
          </div>
        )}

        {items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} eventId={eventId} />
        ))}
      </div>

      {/* Add item area */}
      {isAddingItem ? (
        <ChecklistItemForm
          onSubmit={handleAddItem}
          onCancel={() => setIsAddingItem(false)}
          isPending={addItem.isPending}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingItem(true)}
        >
          + Add item
        </Button>
      )}
    </div>
  );
};

export default ChecklistPage;

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParticipantChecklistEntry } from '@/services/attendance';
import ChecklistItemRow from './ChecklistItemRow';

type LocalChecklistState = Record<
  string,
  { completed: boolean; value: string }
>;

type ChecklistCardProps = {
  checklist: ParticipantChecklistEntry[];
  localChecklist: LocalChecklistState;
  setLocalChecklist: React.Dispatch<React.SetStateAction<LocalChecklistState>>;
  isSaving: boolean;
  hasInteractiveItems: boolean;
  onSave: () => Promise<void>;
  onUpload: (itemId: string, file: File) => Promise<void>;
  uploadingItemId: string | null;
};

const ChecklistCard = ({
  checklist,
  localChecklist,
  setLocalChecklist,
  isSaving,
  hasInteractiveItems,
  onSave,
  onUpload,
  uploadingItemId,
}: ChecklistCardProps) => {
  const { t } = useTranslation('attendee');

  return (
    <Card
      className="animate-appear-from-bottom"
      style={{ animationDelay: 'calc(3 * 50ms)' }}
    >
      <CardHeader>
        <CardTitle className="text-base">
          {t('eventView.checklist.title')}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {t('eventView.checklist.subtitle')}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {checklist.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('eventView.checklist.empty')}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {checklist.map((item, index) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  localCompleted={
                    localChecklist[item.id]?.completed ?? item.completed
                  }
                  localValue={
                    localChecklist[item.id]?.value ?? item.value ?? ''
                  }
                  onCompletedChange={(completed) =>
                    setLocalChecklist((prev) => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], completed },
                    }))
                  }
                  onValueChange={(value) =>
                    setLocalChecklist((prev) => ({
                      ...prev,
                      [item.id]: { ...prev[item.id], value },
                    }))
                  }
                  disabled={isSaving}
                  onUpload={(file) => onUpload(item.id, file)}
                  uploading={uploadingItemId === item.id}
                />
              ))}
            </div>
            {hasInteractiveItems && (
              <Button className="self-end" onClick={onSave} disabled={isSaving}>
                {isSaving
                  ? t('eventView.checklist.saving')
                  : t('eventView.checklist.save')}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChecklistCard;

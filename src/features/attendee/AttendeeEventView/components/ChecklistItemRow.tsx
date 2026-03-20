import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { ParticipantChecklistEntry } from '@/services/attendance';

type ChecklistItemRowProps = {
  item: ParticipantChecklistEntry;
  index: number;
  localCompleted: boolean;
  localValue: string;
  onCompletedChange: (completed: boolean) => void;
  onValueChange: (value: string) => void;
  disabled: boolean;
  onUpload?: (file: File) => Promise<void>;
  uploading?: boolean;
};

const ChecklistItemRow = ({
  item,
  index,
  localCompleted,
  localValue,
  onCompletedChange,
  onValueChange,
  disabled,
  onUpload,
  uploading = false,
}: ChecklistItemRowProps) => {
  const { t } = useTranslation('attendee');

  const typeLabel: Record<ParticipantChecklistEntry['item_type'], string> = {
    checkbox: t('eventView.checklist.type.checkbox'),
    document_upload: t('eventView.checklist.type.document_upload'),
    info_input: t('eventView.checklist.type.info_input'),
  };

  return (
    <div
      className="animate-appear-from-bottom rounded-lg border bg-card px-4 py-3"
      style={{ animationDelay: `calc(${index} * 50ms)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          <span className="flex flex-1 items-center gap-1.5 text-sm font-medium text-foreground">
            {item.label}
            {localCompleted && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-green-500"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </span>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {typeLabel[item.item_type]}
            </Badge>
            {item.required && (
              <Badge variant="outline" className="text-xs">
                {t('eventView.checklist.required')}
              </Badge>
            )}
          </div>
        </div>

        {item.item_type === 'checkbox' && (
          <Checkbox
            checked={localCompleted}
            onCheckedChange={onCompletedChange}
            disabled={disabled}
            className="mt-0.5 shrink-0"
          />
        )}

        {item.item_type === 'document_upload' && item.completed && (
          <Badge variant="default" className="shrink-0 text-xs">
            {t('eventView.checklist.done')}
          </Badge>
        )}
      </div>

      {item.item_type === 'document_upload' && (
        <div className="mt-3 flex items-center gap-2">
          <label className="flex-1">
            <input
              type="file"
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUpload) {
                  onUpload(file).catch(() => {});
                  e.target.value = '';
                }
              }}
            />
            <span
              className={[
                'flex h-8 cursor-pointer items-center justify-center rounded-md border border-dashed px-3 text-xs transition-colors',
                disabled || uploading
                  ? 'cursor-not-allowed opacity-50'
                  : 'border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary',
              ].join(' ')}
            >
              {uploading
                ? t('eventView.checklist.uploading')
                : item.completed
                  ? t('eventView.checklist.reupload')
                  : t('eventView.checklist.upload')}
            </span>
          </label>
        </div>
      )}

      {item.item_type === 'info_input' && (
        <div className="mt-3">
          <Input
            value={localValue}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={t('registration.checklistAction.placeholder')}
            disabled={disabled}
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default ChecklistItemRow;

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type DeleteConfirmDialogProps = {
  open: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const DeleteConfirmDialog = ({
  open,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation('admin');

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-lg">
        <h2
          id="delete-dialog-title"
          className="mb-2 text-base font-semibold text-foreground"
        >
          {t('events.detail.deleteDialog.title')}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('events.detail.deleteDialog.description')}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
            {t('events.detail.deleteDialog.cancel')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {t('events.detail.deleteDialog.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;

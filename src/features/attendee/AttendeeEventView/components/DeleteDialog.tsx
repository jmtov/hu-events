import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type DeleteDialogProps = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleteMutation: { isPending: boolean };
};

const DeleteDialog = ({
  onClose,
  onConfirm,
  deleteMutation,
}: DeleteDialogProps) => {
  const { t } = useTranslation('attendee');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-lg">
        <h2 className="mb-2 text-base font-semibold text-foreground">
          {t('eventView.deleteDialog.title')}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {t('eventView.deleteDialog.description')}
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            {t('eventView.deleteDialog.cancel')}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending
              ? t('eventView.deleting')
              : t('eventView.deleteDialog.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;

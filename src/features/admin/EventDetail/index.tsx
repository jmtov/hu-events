import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '@/components/ui/button';
import { useGetEvent } from '@/hooks/useGetEvent';
import { useDeleteEvent } from '@/hooks/useDeleteEvent';
import SavedBanner from '@/features/admin/EventOverview/components/SavedBanner';
import EventBasicsCard from './components/EventBasicsCard';
import ModulesCard from './components/ModulesCard';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';

type EventDetailProps = {
  eventId: string;
  showSavedBanner: boolean;
};

const EventDetail = ({ eventId, showSavedBanner }: EventDetailProps) => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const eventQuery = useGetEvent(eventId);
  const deleteEvent = useDeleteEvent();

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join/${eventId}`;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleDeleteConfirm = () => {
    deleteEvent.mutate(eventId, {
      onSuccess: () => {
        navigate({ to: '/admin/events' });
      },
    });
  };

  if (eventQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t('events.detail.loading')}
        </p>
      </div>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-destructive">{t('events.detail.error')}</p>
      </div>
    );
  }

  const event = eventQuery.data;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <SavedBanner visible={showSavedBanner} />

      <EventBasicsCard event={event} />

      <ModulesCard modules={event.modules} />

      <div className="flex flex-wrap gap-3">
        {event.modules.contacts && (
          <Link
            to="/admin/events/$eventId/contacts"
            params={{ eventId }}
            className={buttonVariants({ variant: 'outline' })}
          >
            {t('events.detail.actions.contacts')}
          </Link>
        )}

        <Button variant="outline" onClick={handleCopyInviteLink}>
          {linkCopied
            ? t('events.detail.actions.copyInviteLinkCopied')
            : t('events.detail.actions.copyInviteLink')}
        </Button>

        <Link
          to="/admin/events/$eventId/dashboard"
          params={{ eventId }}
          className={buttonVariants()}
        >
          {t('events.detail.actions.dashboard')}
        </Link>

        <Button
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
          className="ml-auto"
        >
          {t('events.detail.actions.delete')}
        </Button>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        isDeleting={deleteEvent.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default EventDetail;

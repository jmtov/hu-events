import { IconArrowLeft, IconLink } from '@tabler/icons-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactsCard from '@/components/ContactsCard';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/features/admin/EventDetail/components/DeleteConfirmDialog';
import { useDeleteEvent } from '@/hooks/useDeleteEvent';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useGetEvent } from '@/hooks/useGetEvent';
import BudgetOverviewCard from './components/BudgetOverviewCard';
import BudgetStatsCard from './components/BudgetStatsCard';
import ChecklistProgressCard from './components/ChecklistProgressCard';
import EventHeader from './components/EventHeader';
import NotificationsSummaryCard from './components/NotificationsSummaryCard';
import ParticipantSummaryCard from './components/ParticipantSummaryCard';
import RsvpCard from './components/RsvpCard';
import SavedBanner from './components/SavedBanner';

type EventOverviewProps = {
  eventId: string;
  showSavedBanner: boolean;
};

const EventOverview = ({ eventId, showSavedBanner }: EventOverviewProps) => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const eventQuery = useGetEvent(eventId);
  const deleteEvent = useDeleteEvent();
  const contactsQuery = useGetContacts(eventId);

  if (eventQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {t('events.overview.loading')}
        </p>
      </div>
    );
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-destructive">
          {t('events.overview.error')}
        </p>
      </div>
    );
  }

  const handleDeleteConfirm = () => {
    deleteEvent.mutate(eventId, {
      onSuccess: () => navigate({ to: '/admin/events' }),
    });
  };

  const handleCopyInviteLink = async () => {
    const url = `${window.location.origin}/join/${eventId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore
    }
  };

  const event = eventQuery.data;
  const participants = event.participants ?? [];
  const checklist = event.checklist ?? [];
  const triggers = event.triggers ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <Link
        to="/admin/events"
        className="animate-appear-from-bottom inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        style={{ animationDelay: 'calc(0 * 50ms)' }}
      >
        <IconArrowLeft size={16} />
        {t('events.list.title')}
      </Link>

      <SavedBanner visible={showSavedBanner} />

      <EventHeader event={event} style={{ animationDelay: 'calc(1 * 50ms)' }} />

      <div
        className="animate-appear-from-bottom flex items-center justify-end gap-2"
        style={{ animationDelay: 'calc(2 * 50ms)' }}
      >
        <span className="truncate rounded border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground w-full">
          {`${window.location.origin}/join/${eventId}`}
        </span>
        <Button variant="outline" size="sm" onClick={handleCopyInviteLink}>
          <IconLink size={16} />
          {copied
            ? t('events.overview.inviteLink.copied')
            : t('events.overview.inviteLink.copy')}
        </Button>
      </div>

      <div
        className="animate-appear-from-bottom grid grid-cols-1 gap-4 sm:grid-cols-2"
        style={{ animationDelay: 'calc(3 * 50ms)' }}
      >
        <RsvpCard participants={participants} />
        {event.modules.checklist && (
          <ChecklistProgressCard items={checklist} />
        )}
        {event.modules.budget && (
          <BudgetOverviewCard eventId={eventId} />
        )}
        {event.modules.budget && (
          <BudgetStatsCard
            eventId={eventId}
            participantCount={participants.length}
            expectedAttendees={event.expected_attendees}
          />
        )}
      </div>

      {event.modules.notifications && (
        <div
          className="animate-appear-from-bottom"
          style={{ animationDelay: 'calc(4 * 50ms)' }}
        >
          <NotificationsSummaryCard triggers={triggers} />
        </div>
      )}

      <ParticipantSummaryCard
        participants={participants}
        style={{ animationDelay: 'calc(5 * 50ms)' }}
      />

      {event.modules.contacts && (
        <div
          className="animate-appear-from-bottom"
          style={{ animationDelay: 'calc(6 * 50ms)' }}
        >
          <ContactsCard contacts={contactsQuery.data ?? []} ns="admin" />
        </div>
      )}

      <div
        className="animate-appear-from-bottom flex justify-end"
        style={{ animationDelay: 'calc(7 * 50ms)' }}
      >
        <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
          {t('events.overview.delete')}
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

export default EventOverview;

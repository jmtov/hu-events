import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { IconArrowLeft, IconLink } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useGetEvent } from '@/hooks/useGetEvent';
import { Button } from '@/components/ui/button';
import SavedBanner from './components/SavedBanner';
import EventHeader from './components/EventHeader';
import RsvpCard from './components/RsvpCard';
import ChecklistProgressCard from './components/ChecklistProgressCard';
import ParticipantSummaryCard from './components/ParticipantSummaryCard';
import NotificationsSummaryCard from './components/NotificationsSummaryCard';

type EventOverviewProps = {
  eventId: string;
  showSavedBanner: boolean;
};

const EventOverview = ({ eventId, showSavedBanner }: EventOverviewProps) => {
  const { t } = useTranslation('admin');
  const [copied, setCopied] = useState(false);

  const eventQuery = useGetEvent(eventId);

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
        className="animate-appear-from-bottom flex justify-end"
        style={{ animationDelay: 'calc(2 * 50ms)' }}
      >
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
    </div>
  );
};

export default EventOverview;

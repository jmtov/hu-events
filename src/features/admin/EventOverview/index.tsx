import { useTranslation } from 'react-i18next';
import { useGetEvent } from '@/hooks/useGetEvent';
import { useGetParticipants } from '@/hooks/useGetParticipants';
import { useGetEventChecklist } from '@/hooks/useGetEventChecklist';
import SavedBanner from './components/SavedBanner';
import EventHeader from './components/EventHeader';
import RsvpCard from './components/RsvpCard';
import ChecklistProgressCard from './components/ChecklistProgressCard';

interface EventOverviewProps {
  eventId: string;
  showSavedBanner: boolean;
}

const EventOverview = ({ eventId, showSavedBanner }: EventOverviewProps) => {
  const { t } = useTranslation('admin');

  const eventQuery = useGetEvent(eventId);
  const participantsQuery = useGetParticipants(eventId);
  const checklistQuery = useGetEventChecklist(eventId);

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

  const event = eventQuery.data;
  const participants = participantsQuery.data ?? [];
  const checklistStats = checklistQuery.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <SavedBanner visible={showSavedBanner} />

      <EventHeader event={event} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RsvpCard participants={participants} />
        <ChecklistProgressCard stats={checklistStats} />
      </div>
    </div>
  );
};

export default EventOverview;

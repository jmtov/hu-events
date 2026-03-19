import { useGetTriggers } from '@/hooks/useGetTriggers';
import TriggerRow from './TriggerRow';

interface NotificationsPanelProps {
  eventId: string;
}

const NotificationsPanel = ({ eventId }: NotificationsPanelProps) => {
  const { data: triggers = [], isLoading } = useGetTriggers(eventId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  if (triggers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          No notification triggers configured for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {triggers.map((trigger) => (
        <TriggerRow key={trigger.id} trigger={trigger} eventId={eventId} />
      ))}
    </div>
  );
};

export default NotificationsPanel;

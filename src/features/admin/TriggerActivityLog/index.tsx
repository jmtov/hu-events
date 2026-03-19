import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTriggerLog } from '@/hooks/useGetTriggerLog';
import type { TriggerLogChannel, TriggerLogStatus } from '@/types/trigger-log';

const CHANNEL_LABELS: Record<TriggerLogChannel, string> = {
  slack: 'Slack',
  email: 'Email',
  whatsapp: 'WhatsApp',
};

const CHANNEL_COLORS: Record<TriggerLogChannel, string> = {
  slack: 'bg-indigo-50 text-indigo-700 ring-indigo-700/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20',
  email: 'bg-blue-50 text-blue-700 ring-blue-700/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20',
  whatsapp: 'bg-green-50 text-green-700 ring-green-700/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20',
};

const STATUS_COLORS: Record<TriggerLogStatus, string> = {
  sent: 'bg-green-50 text-green-700 ring-green-700/20 dark:bg-green-400/10 dark:text-green-400 dark:ring-green-400/20',
  failed: 'bg-red-50 text-red-700 ring-red-700/20 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20',
};

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const TriggerActivityLog = () => {
  const { eventId } = useParams({ from: '/admin/events/$eventId/dashboard' });
  const { data: entries = [], isLoading } = useGetTriggerLog(eventId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trigger activity log</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}

        {!isLoading && entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No notifications have fired yet.
            </p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-3 pr-6">Timestamp</th>
                  <th className="pb-3 pr-6">Trigger</th>
                  <th className="pb-3 pr-6">Channel</th>
                  <th className="pb-3 pr-6">Recipient</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="text-sm">
                    <td className="py-3 pr-6 text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(entry.fired_at)}
                    </td>
                    <td className="py-3 pr-6 font-medium text-foreground">
                      {entry.trigger_name}
                    </td>
                    <td className="py-3 pr-6">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CHANNEL_COLORS[entry.channel]}`}
                      >
                        {CHANNEL_LABELS[entry.channel]}
                      </span>
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground">
                      {entry.recipient_name}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[entry.status]}`}
                        title={entry.error ?? undefined}
                      >
                        {entry.status === 'sent' ? 'Delivered' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TriggerActivityLog;

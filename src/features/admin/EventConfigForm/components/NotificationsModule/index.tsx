import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TriggerChannel, TriggerRecipient, TriggerTiming } from '@/types/trigger';
import type { DraftTrigger } from './constants';

type NotificationsModuleProps = {
  draftTriggers: DraftTrigger[];
  onUpdateTrigger: (index: number, patch: Partial<DraftTrigger>) => void;
};

const SOURCE_LABELS: Record<DraftTrigger['source'], string> = {
  checklist: 'From checklist',
  milestone: 'Platform milestone',
};

const TIMING_LABELS: Record<TriggerTiming, string> = {
  immediately: 'Immediately',
  days_before: 'Days before',
  hours_after: 'Hours after',
};

const NotificationsModule = ({ draftTriggers, onUpdateTrigger }: NotificationsModuleProps) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Configure when and how attendees and admins are notified.
      </p>

      <div className="flex flex-col gap-2">
        {draftTriggers.map((trigger, index) => {
          const isChecklist = trigger.source === 'checklist';
          const showTimingValue =
            isChecklist || trigger.timing === 'days_before' || trigger.timing === 'hours_after';

          return (
            <div
              key={trigger.name}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-medium text-card-foreground">
                  {trigger.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {SOURCE_LABELS[trigger.source]}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {isChecklist ? (
                  <span className="w-36 text-sm text-muted-foreground">Days before</span>
                ) : (
                  <Select
                    value={trigger.timing}
                    onValueChange={(v) =>
                      onUpdateTrigger(index, {
                        timing: v as TriggerTiming,
                        timingValue: v === 'immediately' ? 0 : trigger.timingValue,
                      })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediately">Immediately</SelectItem>
                      <SelectItem value="days_before">Days before</SelectItem>
                      <SelectItem value="hours_after">Hours after</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {showTimingValue && (
                  <Input
                    type="number"
                    min={1}
                    value={trigger.timingValue}
                    onChange={(e) =>
                      onUpdateTrigger(index, { timingValue: Number(e.target.value) })
                    }
                    className="w-16 text-center"
                    aria-label={TIMING_LABELS[trigger.timing]}
                  />
                )}
              </div>

              <Select
                value={trigger.channel}
                onValueChange={(v) =>
                  onUpdateTrigger(index, { channel: v as TriggerChannel })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={trigger.recipient}
                onValueChange={(v) =>
                  onUpdateTrigger(index, { recipient: v as TriggerRecipient })
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendee">Attendee</SelectItem>
                  <SelectItem value="hr_admin">HR Admin</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsModule;

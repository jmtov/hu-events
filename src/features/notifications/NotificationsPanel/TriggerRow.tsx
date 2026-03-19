import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTrigger } from '@/hooks/useUpdateTrigger';
import type {
  Trigger,
  TriggerChannel,
  TriggerRecipient,
  TriggerTiming,
} from '@/types/trigger';

const SOURCE_LABELS: Record<Trigger['source'], string> = {
  checklist: 'From checklist',
  milestone: 'Platform milestone',
};

const TIMING_LABELS: Record<TriggerTiming, string> = {
  immediately: 'Immediately',
  days_before: 'Days before',
  hours_after: 'Hours after',
};


interface TriggerRowProps {
  trigger: Trigger;
  eventId: string;
}

const TriggerRow = ({ trigger, eventId }: TriggerRowProps) => {
  const [timing, setTiming] = useState<TriggerTiming>(trigger.timing);
  const [timingValue, setTimingValue] = useState(trigger.timingValue);
  const [channel, setChannel] = useState<TriggerChannel>(trigger.channel);
  const [recipient, setRecipient] = useState<TriggerRecipient>(trigger.recipient);

  const updateTrigger = useUpdateTrigger(eventId);
  const showTimingValue = timing === 'days_before' || timing === 'hours_after';

  const handleSave = () => {
    updateTrigger.mutate({
      triggerId: trigger.id,
      payload: { timing, timingValue, channel, recipient },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium text-card-foreground">
          {trigger.name}
        </span>
        <span className="text-xs text-muted-foreground">
          {SOURCE_LABELS[trigger.source]}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Select
          value={timing}
          onValueChange={(v) => setTiming(v as TriggerTiming)}
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

        {showTimingValue && (
          <Input
            type="number"
            min={1}
            value={timingValue}
            onChange={(e) => setTimingValue(Number(e.target.value))}
            className="w-16 text-center"
            aria-label={TIMING_LABELS[timing]}
          />
        )}
      </div>

      <Select
        value={channel}
        onValueChange={(v) => setChannel(v as TriggerChannel)}
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
        value={recipient}
        onValueChange={(v) => setRecipient(v as TriggerRecipient)}
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

      <Button
        size="sm"
        onClick={handleSave}
        disabled={updateTrigger.isPending}
        className="shrink-0"
      >
        Save
      </Button>
    </div>
  );
};

export default TriggerRow;

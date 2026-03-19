import type {
  TriggerChannel,
  TriggerRecipient,
  TriggerSource,
  TriggerTiming,
} from '@/types/trigger';

export type DraftTrigger = {
  name: string;
  source: TriggerSource;
  timing: TriggerTiming;
  timingValue: number;
  channel: TriggerChannel;
  recipient: TriggerRecipient;
};

export const DEFAULT_DRAFT_TRIGGERS: DraftTrigger[] = [
  {
    name: 'RSVP hits 50%',
    source: 'milestone',
    timing: 'immediately',
    timingValue: 0,
    channel: 'slack',
    recipient: 'hr_admin',
  },
  {
    name: 'Event ended',
    source: 'milestone',
    timing: 'immediately',
    timingValue: 0,
    channel: 'email',
    recipient: 'both',
  },
];

export const DEFAULT_CHECKLIST_TRIGGER: Pick<DraftTrigger, 'timing' | 'timingValue' | 'channel' | 'recipient'> = {
  timing: 'days_before',
  timingValue: 3,
  channel: 'email',
  recipient: 'attendee',
};

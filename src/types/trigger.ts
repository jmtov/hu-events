export const TRIGGER_SOURCES = ['checklist', 'milestone'] as const;
export type TriggerSource = (typeof TRIGGER_SOURCES)[number];

export const TRIGGER_TIMINGS = ['immediately', 'days_before', 'hours_after'] as const;
export type TriggerTiming = (typeof TRIGGER_TIMINGS)[number];

export const TRIGGER_CHANNELS = ['slack', 'email', 'whatsapp'] as const;
export type TriggerChannel = (typeof TRIGGER_CHANNELS)[number];

export const TRIGGER_RECIPIENTS = ['attendee', 'hr_admin', 'both'] as const;
export type TriggerRecipient = (typeof TRIGGER_RECIPIENTS)[number];

export type Trigger = {
  id: string;
  eventId: string;
  name: string;
  source: TriggerSource;
  timing: TriggerTiming;
  timingValue: number;
  channel: TriggerChannel;
  recipient: TriggerRecipient;
};

export type UpdateTriggerPayload = Partial<
  Pick<Trigger, 'timing' | 'timingValue' | 'channel' | 'recipient'>
>;

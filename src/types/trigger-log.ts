export const TRIGGER_LOG_CHANNELS = ['slack', 'email', 'whatsapp'] as const;
export type TriggerLogChannel = (typeof TRIGGER_LOG_CHANNELS)[number];

export const TRIGGER_LOG_STATUSES = ['sent', 'failed'] as const;
export type TriggerLogStatus = (typeof TRIGGER_LOG_STATUSES)[number];

export type TriggerLogEntry = {
  id: string;
  event_id: string;
  trigger_id: string;
  trigger_name: string;
  fired_at: string;
  channel: TriggerLogChannel;
  recipient_name: string;
  status: TriggerLogStatus;
  error: string | null;
};

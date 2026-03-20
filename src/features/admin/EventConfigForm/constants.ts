import { z } from 'zod';
import type { EventModules } from '@/types/event';

export const DEFAULT_MODULES: EventModules = {
  participantList: false,
  checklist: false,
  budget: false,
  notifications: false,
  contacts: false,
};

export const EVENT_TYPE_OPTIONS = [
  { value: 'hr_retreat', label: 'HR Retreat' },
  { value: 'bdr_call', label: 'BDR Call' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
] as const;

export const EVENT_TYPES = ['hr_retreat', 'bdr_call', 'hackathon', 'workshop', 'other'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const eventConfigSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Description cannot be blank'),
  event_type: z.enum(EVENT_TYPES),
  date_start: z.string().min(1, 'Start date is required'),
  date_end: z.string().optional(),
  location: z.string().optional(),
  expected_attendees: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number.isInteger(Number(val)) && Number(val) > 0),
      'Must be a positive integer',
    ),
});

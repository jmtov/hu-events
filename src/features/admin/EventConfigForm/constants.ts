import { z } from 'zod';
import type { EventModules } from '@/types/event';

export const DEFAULT_MODULES: EventModules = {
  participantList: true,
  checklist: true,
  budget: false,
  notifications: true,
  contacts: false,
};

export const eventConfigSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Description cannot be blank'),
  event_type: z.string().min(1, 'Event type is required'),
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

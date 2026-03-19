import { z } from 'zod';
import { EVENT_TYPES } from '@/types/event';

export const eventCreateSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Description cannot be blank'),
  event_type: z.enum(EVENT_TYPES, { message: 'Please select an event type' }),
  date_start: z.string().min(1, 'Start date is required'),
  date_end: z.string().optional(),
  location: z.string().optional(),
});

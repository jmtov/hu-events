import { z } from 'zod';

export const eventCreateSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Description cannot be blank'),
  event_type: z.string().min(1, 'Event type is required'),
  date_start: z.string().min(1, 'Start date is required'),
  date_end: z.string().optional(),
  location: z.string().optional(),
});

import { z } from 'zod';
import { EVENT_TYPES } from '@/types/event';

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  event_type: z.enum(EVENT_TYPES),
  date_start: z.string().min(1),
  date_end: z.string().optional(),
  location: z.string().optional(),
});

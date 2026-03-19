import type { z } from 'zod';
import type { eventCreateSchema } from './constants';

export type EventCreateValues = z.infer<typeof eventCreateSchema>;

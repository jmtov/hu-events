import type { z } from 'zod';
import type { eventConfigSchema } from './constants';

export type EventConfigValues = z.infer<typeof eventConfigSchema>;

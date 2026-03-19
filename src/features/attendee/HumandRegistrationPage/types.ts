import type { z } from 'zod';
import type { registrationSchema } from './constants';

export type RegistrationValues = z.infer<typeof registrationSchema>;

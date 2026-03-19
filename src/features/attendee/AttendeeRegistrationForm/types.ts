import type { z } from 'zod';
import type { attendeeRegistrationSchema } from './constants';

export type AttendeeRegistrationValues = z.infer<
  ReturnType<typeof attendeeRegistrationSchema>
>;

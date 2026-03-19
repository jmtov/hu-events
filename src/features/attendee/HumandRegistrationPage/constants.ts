import { z } from 'zod';

export const registrationSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().min(1).email(),
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().min(1),
  role: z.string(),
  preferences: z.record(z.string(), z.string()),
});

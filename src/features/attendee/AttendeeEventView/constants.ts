import { z } from 'zod';

export const profileSchema = z.object({
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().min(1),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

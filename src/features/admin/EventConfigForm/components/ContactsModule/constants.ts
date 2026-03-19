import { z } from 'zod';

export const contactItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  email: z.string().min(1, 'Email is required').email('Must be a valid email'),
  phone: z.string().optional(),
});

export type ContactItemValues = z.infer<typeof contactItemSchema>;

import { z } from 'zod';

export const addParticipantSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
});

export type AddParticipantValues = z.infer<typeof addParticipantSchema>;

export const updateParticipantSchema = z.object({
  full_name: z.string().min(1, 'Name is required').optional(),
  location_city: z.string().optional(),
  location_region: z.string().optional(),
  location_country: z.string().optional(),
  rsvp_status: z.enum(['pending', 'confirmed', 'declined']).optional(),
});

export type UpdateParticipantValues = z.infer<typeof updateParticipantSchema>;

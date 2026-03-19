import { z } from 'zod';
import i18n from '@/i18n';

// Schema is a function so translations are resolved at validation time,
// not at module evaluation time (i18next-http-backend loads async).
export const attendeeRegistrationSchema = () =>
  z.object({
    fullName: z
      .string()
      .min(1, i18n.t('attendee:registration.fields.fullName.errors.required')),
    email: z
      .string()
      .min(1, i18n.t('attendee:registration.fields.email.errors.required'))
      .email(i18n.t('attendee:registration.fields.email.errors.invalid')),
    dietary: z.string(),
  });

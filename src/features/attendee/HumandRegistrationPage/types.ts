import type { z } from 'zod'
import type { registrationSchema } from './constants'

export type Event = {
  title: string;
  type: string;
  date: string;
  location: string;
  description: string;
}

export type PreferenceField = {
  id: string;
  labelKey: string;
  type: 'select' | 'text';
  options: string[];
}

export type RegistrationValues = z.infer<typeof registrationSchema>

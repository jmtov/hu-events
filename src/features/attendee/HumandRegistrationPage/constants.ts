import { z } from 'zod'
import type { Event, PreferenceField } from './types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
export const registrationSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().min(1).email(),
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().min(1),
  role: z.string(),
  preferences: z.record(z.string(), z.string()),
})

// ---------------------------------------------------------------------------
// Demo data — replace with real API data once the event endpoint is ready
// ---------------------------------------------------------------------------
export const DEMO_EVENT: Event = {
  title: 'HR Retreat 2026',
  type: 'HR Retreat',
  date: '14–16 April 2026',
  location: 'Cartagena, Colombia',
  description:
    'Retiro anual da equipe de RH para planejamento estratégico, atividades de team building e alinhamentos para o segundo semestre.',
}

export const DEMO_PREFERENCE_FIELDS: PreferenceField[] = [
  {
    id: 'dietary',
    labelKey: 'registration.fields.dietary.label',
    type: 'select',
    options: ['Nenhuma', 'Vegetariano', 'Vegano', 'Sem glúten', 'Sem lactose', 'Outra'],
  },
  {
    id: 'tshirt',
    labelKey: 'registration.fields.tshirt.label',
    type: 'select',
    options: ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
  },
  {
    id: 'emergency_contact',
    labelKey: 'registration.fields.emergencyContact.label',
    type: 'text',
    options: [],
  },
]

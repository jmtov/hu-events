import { z } from 'zod';

export const PREFERENCE_FIELD_TYPE_OPTIONS = [
  { value: 'text', label: 'Texto livre' },
  { value: 'select', label: 'Seleção' },
  { value: 'boolean', label: 'Sim / Não' },
] as const;

export const PREFERENCE_FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Texto',
  select: 'Seleção',
  boolean: 'Sim / Não',
};

export const PREFERENCE_FIELD_TYPE_COLORS: Record<string, string> = {
  text: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  select: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  boolean: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export const preferenceFieldSchema = z
  .object({
    label: z.string().min(1, 'O nome do campo é obrigatório'),
    field_type: z.enum(['text', 'select', 'boolean']),
    options_raw: z.string().optional(),
    required: z.boolean(),
  })
  .refine(
    (data) =>
      data.field_type !== 'select' || (data.options_raw?.trim() ?? '').length > 0,
    {
      message: 'Informe ao menos uma opção para campos de seleção',
      path: ['options_raw'],
    },
  );

export type PreferenceFieldValues = z.infer<typeof preferenceFieldSchema>;

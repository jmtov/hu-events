import { z } from 'zod';

export const checklistItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['checkbox', 'document_upload', 'info_input']),
  required: z.boolean(),
});

export type ChecklistItemValues = z.infer<typeof checklistItemSchema>;

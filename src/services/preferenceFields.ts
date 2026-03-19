import { api } from '@/lib/api';
import type { PreferenceField } from '@/types/participant';

export type CreatePreferenceFieldPayload = {
  label: string;
  field_type: PreferenceField['field_type'];
  options?: string[] | null;
  required?: boolean;
};

export type UpdatePreferenceFieldPayload = Partial<CreatePreferenceFieldPayload>;

export const preferenceFieldsService = {
  add: (eventId: string, payload: CreatePreferenceFieldPayload): Promise<PreferenceField> =>
    api
      .post<PreferenceField>(`/events/${eventId}/preference-fields`, payload)
      .then((r) => r.data),

  update: (fieldId: string, payload: UpdatePreferenceFieldPayload): Promise<PreferenceField> =>
    api
      .patch<PreferenceField>(`/preference-fields/${fieldId}`, payload)
      .then((r) => r.data),

  remove: (fieldId: string): Promise<void> =>
    api.delete(`/preference-fields/${fieldId}`).then((r) => r.data),
};

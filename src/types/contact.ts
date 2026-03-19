export type Contact = {
  id: string;
  event_id: string;
  name: string;
  role: string;
  email: string;
  phone: string | null;
};

export type CreateContactPayload = {
  name: string;
  role: string;
  email: string;
  phone?: string;
};

export type UpdateContactPayload = Partial<CreateContactPayload>;

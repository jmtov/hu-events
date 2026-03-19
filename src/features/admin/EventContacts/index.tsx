import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAddContact } from '@/hooks/useAddContact';
import { useDeleteContact } from '@/hooks/useDeleteContact';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useUpdateContact } from '@/hooks/useUpdateContact';
import type { ContactFormValues } from './constants';
import ContactCard from './components/ContactCard';
import ContactForm from './components/ContactForm';

type EventContactsProps = {
  eventId: string;
};

const EventContacts = ({ eventId }: EventContactsProps) => {
  const { t } = useTranslation('admin');
  const [isAdding, setIsAdding] = useState(false);

  const contactsQuery = useGetContacts(eventId);
  const addContact = useAddContact(eventId);
  const updateContact = useUpdateContact(eventId);
  const deleteContact = useDeleteContact(eventId);

  const handleAdd = async (values: ContactFormValues) => {
    await addContact.mutateAsync({
      name: values.name,
      role: values.role,
      email: values.email,
      phone: values.phone || undefined,
    });
    setIsAdding(false);
  };

  const handleUpdate = (contactId: string) => async (values: ContactFormValues) => {
    await updateContact.mutateAsync({
      contactId,
      payload: {
        name: values.name,
        role: values.role,
        email: values.email,
        phone: values.phone || undefined,
      },
    });
  };

  const contacts = contactsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t('events.contacts.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('events.contacts.subtitle')}
          </p>
        </div>
        <Link
          to="/admin/events/$eventId"
          params={{ eventId }}
          search={{ created: false }}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          {t('events.contacts.backToEvent')}
        </Link>
      </div>

      {contactsQuery.isLoading && (
        <p className="text-sm text-muted-foreground">{t('events.contacts.loading')}</p>
      )}

      {contactsQuery.isError && (
        <p className="text-sm text-destructive">{t('events.contacts.error')}</p>
      )}

      {!contactsQuery.isLoading && contacts.length === 0 && !isAdding && (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm font-medium text-foreground">
            {t('events.contacts.empty.title')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('events.contacts.empty.description')}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isUpdating={updateContact.isPending}
            isDeleting={deleteContact.isPending}
            onUpdate={handleUpdate(contact.id)}
            onDelete={() => deleteContact.mutate(contact.id)}
          />
        ))}

        {isAdding ? (
          <ContactForm
            onSubmit={handleAdd}
            onCancel={() => setIsAdding(false)}
            isPending={addContact.isPending}
          />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            + {t('events.contacts.addContact')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventContacts;

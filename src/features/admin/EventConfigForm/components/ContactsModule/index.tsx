import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { ContactItemValues } from './constants';
import ContactItemForm from './ContactItemForm';
import DraftContactRow, { type DraftContact } from './DraftContactRow';

type ContactsModuleProps = {
  draftContacts: DraftContact[];
  isAddingContact: boolean;
  editingKey: string | null;
  onAddContact: (values: ContactItemValues) => void;
  onUpdateContact: (key: string, values: ContactItemValues) => void;
  onDeleteContact: (key: string) => void;
  onSetAddingContact: (value: boolean) => void;
  onSetEditingKey: (key: string | null) => void;
};

const ContactsModule = ({
  draftContacts,
  isAddingContact,
  editingKey,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onSetAddingContact,
  onSetEditingKey,
}: ContactsModuleProps) => {
  const { t } = useTranslation('admin');

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('events.create.contacts.description')}
      </p>

      {draftContacts.length === 0 && !isAddingContact && (
        <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t('events.create.contacts.empty')}
          </p>
        </div>
      )}

      {draftContacts.map((contact) =>
        editingKey === contact._key ? (
          <ContactItemForm
            key={contact._key}
            defaultValues={contact}
            onSubmit={(values) => onUpdateContact(contact._key, values)}
            onCancel={() => onSetEditingKey(null)}
            asDiv
          />
        ) : (
          <DraftContactRow
            key={contact._key}
            contact={contact}
            onEdit={() => onSetEditingKey(contact._key)}
            onDelete={() => onDeleteContact(contact._key)}
          />
        ),
      )}

      {isAddingContact ? (
        <ContactItemForm
          onSubmit={onAddContact}
          onCancel={() => onSetAddingContact(false)}
          asDiv
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSetAddingContact(true)}
        >
          + {t('events.create.contacts.addContact')}
        </Button>
      )}
    </div>
  );
};

export default ContactsModule;

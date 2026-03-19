import { useState } from 'react';
import { IconMail, IconPencil, IconPhone, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { Contact } from '@/types/contact';
import type { ContactFormValues } from '../constants';
import ContactForm from './ContactForm';

type ContactCardProps = {
  contact: Contact;
  isUpdating: boolean;
  isDeleting: boolean;
  onUpdate: (values: ContactFormValues) => Promise<void>;
  onDelete: () => void;
};

const ContactCard = ({
  contact,
  isUpdating,
  isDeleting,
  onUpdate,
  onDelete,
}: ContactCardProps) => {
  const { t } = useTranslation('admin');
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ContactForm
        defaultValues={{
          name: contact.name,
          role: contact.role,
          email: contact.email,
          phone: contact.phone ?? '',
        }}
        onSubmit={async (values) => {
          await onUpdate(values);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        isPending={isUpdating}
      />
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {contact.name}
          </span>
          <span className="text-xs text-muted-foreground">{contact.role}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconMail size={12} />
            {contact.email}
          </span>
          {contact.phone && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconPhone size={12} />
              {contact.phone}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsEditing(true)}
          disabled={isDeleting}
          aria-label={t('events.contacts.card.editAriaLabel')}
        >
          <IconPencil size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive"
          aria-label={t('events.contacts.card.deleteAriaLabel')}
        >
          <IconTrash size={14} />
        </Button>
      </div>
    </div>
  );
};

export default ContactCard;

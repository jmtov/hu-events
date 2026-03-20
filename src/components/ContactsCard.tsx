import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contact } from '@/types/contact';

type ContactsCardProps = {
  contacts: Contact[];
  ns?: 'admin' | 'attendee';
};

const ContactsCard = ({ contacts, ns = 'attendee' }: ContactsCardProps) => {
  const { t } = useTranslation(ns);
  const key = ns === 'admin' ? 'events.detail.contacts' : 'eventView.contacts';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t(`${key}.title`)}</CardTitle>
      </CardHeader>
      <CardContent>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(`${key}.empty`)}</p>
        ) : (
          <ul className="divide-y">
            {contacts.map((contact) => (
              <li key={contact.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.role}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{contact.email}</span>
                  {contact.phone && <span>{contact.phone}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactsCard;

import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import type { ContactItemValues } from './constants';

export type DraftContact = ContactItemValues & { _key: string };

type DraftContactRowProps = {
  contact: DraftContact;
  onEdit: () => void;
  onDelete: () => void;
};

const DraftContactRow = ({ contact, onEdit, onDelete }: DraftContactRowProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="font-medium text-card-foreground">{contact.name}</span>
      <span className="text-xs text-muted-foreground">
        {contact.role} &middot; {contact.email}
        {contact.phone ? ` · ${contact.phone}` : ''}
      </span>
    </div>
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onEdit}
        aria-label="Edit contact"
      >
        <IconPencil size={14} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label="Remove contact"
        className="text-destructive hover:text-destructive"
      >
        <IconTrash size={14} />
      </Button>
    </div>
  </div>
);

export default DraftContactRow;

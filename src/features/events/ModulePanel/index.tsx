import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { useUpdateEventModules } from '@/hooks/useUpdateEventModules';
import { cn } from '@/lib/utils';
import type { Event, EventModules } from '@/types/event';
import ModuleToggleRow from './ModuleToggleRow';

type ModulePanelProps = {
  event: Event;
};

type ModuleKey = keyof EventModules;

type ModuleConfig = {
  key: ModuleKey;
  label: string;
  description: string;
  content: (eventId: string) => React.ReactNode;
};

const MODULE_CONFIG: ModuleConfig[] = [
  {
    key: 'participantList',
    label: 'Participant List',
    description: 'Track confirmed attendees and manage RSVPs for this event.',
    content: () => (
      <p className="text-sm text-muted-foreground">
        Participants who confirm via the registration link will appear here.
        Manage the list after saving.
      </p>
    ),
  },
  {
    key: 'checklist',
    label: 'Pre-event Checklist',
    description: 'Tasks and documents attendees must complete before the event.',
    content: (eventId) => (
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Define tasks, uploads and required info for attendees.
        </p>
        <Link
          to="/admin/events/$eventId/checklist"
          params={{ eventId }}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Manage checklist
        </Link>
      </div>
    ),
  },
  {
    key: 'budget',
    label: 'Budget & Cost',
    description: 'Track expenses and set a budget cap for this event.',
    content: () => (
      <p className="text-sm text-muted-foreground">
        Budget tracking fields coming soon.
      </p>
    ),
  },
  {
    key: 'notifications',
    label: 'Notifications',
    description: 'Send automated reminders and alerts to attendees.',
    content: () => (
      <p className="text-sm text-muted-foreground">
        Notification rules and scheduling coming soon.
      </p>
    ),
  },
  {
    key: 'contacts',
    label: 'Contact Info',
    description: 'Collect emergency contacts and dietary preferences.',
    content: () => (
      <p className="text-sm text-muted-foreground">
        Contact info fields coming soon.
      </p>
    ),
  },
];

const ModulePanel = ({ event }: ModulePanelProps) => {
  const [modules, setModules] = useState<EventModules>({ ...event.modules });
  const updateModules = useUpdateEventModules(event.id);

  const handleToggle = (key: ModuleKey, value: boolean) => {
    setModules((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateModules.mutate(modules);
  };

  return (
    <div className="space-y-3">
      {MODULE_CONFIG.map((mod) => (
        <ModuleToggleRow
          key={mod.key}
          id={mod.key}
          label={mod.label}
          description={mod.description}
          enabled={modules[mod.key]}
          onToggle={(value) => handleToggle(mod.key, value)}
        >
          {mod.content(event.id)}
        </ModuleToggleRow>
      ))}

      {/* Save button — always visible at the bottom of the module list */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-5 py-4">
        <p className="text-xs text-muted-foreground">
          {updateModules.isSuccess
            ? 'Modules saved successfully.'
            : 'Toggle modules on or off, then save your changes.'}
        </p>
        <Button
          onClick={handleSave}
          disabled={updateModules.isPending}
          size="sm"
        >
          {updateModules.isPending ? 'Saving...' : 'Save modules'}
        </Button>
      </div>
    </div>
  );
};

export default ModulePanel;

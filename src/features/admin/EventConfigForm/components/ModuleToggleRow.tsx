import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type ModuleToggleRowProps = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
};

/**
 * A single expandable module row.
 *
 * - Toggle controls the enabled state (managed by parent).
 * - Children are mounted only when the module is enabled (performance requirement).
 * - The collapsible panel uses the CSS grid trick for a smooth height transition.
 *   When closing: the visual collapse plays first, then children unmount after
 *   the transition ends so they are never visible during the animation.
 */
const ModuleToggleRow = ({
  id,
  label,
  description,
  enabled,
  onToggle,
  children,
}: ModuleToggleRowProps) => {
  // isMounted controls whether children are in the DOM.
  // It lags behind `enabled` on close to let the CSS transition finish first.
  const [isMounted, setIsMounted] = useState(enabled);

  useEffect(() => {
    if (enabled) {
      setIsMounted(true);
    } else {
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <Switch
          id={`module-toggle-${id}`}
          checked={enabled}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${label}`}
        />
      </div>

      {/* Collapsible content — CSS grid trick for smooth height animation */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          enabled ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          {isMounted && children && (
            <div className="border-t border-border px-5 py-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleToggleRow;

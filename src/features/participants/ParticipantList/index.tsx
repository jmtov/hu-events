import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from '@tanstack/react-router';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAddParticipant } from '@/hooks/useAddParticipant';
import { useGetParticipants } from '@/hooks/useGetParticipants';
import { useRemoveParticipant } from '@/hooks/useRemoveParticipant';
import { useUpdateParticipant } from '@/hooks/useUpdateParticipant';
import type { Participant, RsvpStatus } from '@/types/participant';
import {
  addParticipantSchema,
  updateParticipantSchema,
  type AddParticipantValues,
  type UpdateParticipantValues,
} from './constants';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatLocation(p: Participant): string {
  const parts = [p.location_city, p.location_region].filter(Boolean).join(', ');
  const country = p.location_country;
  if (parts && country) return `${parts} - ${country}`;
  if (parts) return parts;
  if (country) return country;
  return '—';
}

const RSVP_BADGE: Record<RsvpStatus, { label: string; className: string }> = {
  confirmed: {
    label: 'Confirmed',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  declined: {
    label: 'Declined',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function RsvpBadge({ status }: { status: RsvpStatus }) {
  const { label, className } = RSVP_BADGE[status] ?? RSVP_BADGE.pending;
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function PassportFlag({ hasPassport }: { hasPassport: boolean }) {
  return (
    <span
      className={
        hasPassport ? 'text-xs font-medium text-green-700' : 'text-xs text-muted-foreground'
      }
    >
      {hasPassport ? 'Yes' : 'No'}
    </span>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-44" /></TableCell>
          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
          <TableCell />
        </TableRow>
      ))}
    </>
  );
}

// ── Edit dialog ───────────────────────────────────────────────────────────────

type EditParticipantDialogProps = {
  participant: Participant;
  eventId: string;
};

function EditParticipantDialog({ participant, eventId }: EditParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const update = useUpdateParticipant();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateParticipantValues>({
    resolver: zodResolver(updateParticipantSchema),
    defaultValues: {
      full_name: participant.full_name ?? '',
      location_city: participant.location_city ?? '',
      location_region: participant.location_region ?? '',
      location_country: participant.location_country ?? '',
    },
  });

  const onSubmit = async (values: UpdateParticipantValues) => {
    await update.mutateAsync({
      participantId: participant.id,
      eventId,
      payload: values,
    });
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset({
        full_name: participant.full_name ?? '',
        location_city: participant.location_city ?? '',
        location_region: participant.location_region ?? '',
        location_country: participant.location_country ?? '',
      });
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        Edit
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit participant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Jane Smith"
              disabled={update.isPending}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location_city">City</Label>
              <Input
                id="location_city"
                {...register('location_city')}
                placeholder="São Paulo"
                disabled={update.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location_region">Region / State</Label>
              <Input
                id="location_region"
                {...register('location_region')}
                placeholder="SP"
                disabled={update.isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location_country">Country</Label>
            <Input
              id="location_country"
              {...register('location_country')}
              placeholder="Brazil"
              disabled={update.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Remove dialog ─────────────────────────────────────────────────────────────

type RemoveButtonProps = {
  participant: Participant;
  eventId: string;
};

function RemoveButton({ participant, eventId }: RemoveButtonProps) {
  const remove = useRemoveParticipant();

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" />
        }
      >
        Remove
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove participant?</AlertDialogTitle>
          <AlertDialogDescription>
            {participant.full_name
              ? `${participant.full_name} (${participant.email})`
              : participant.email}{' '}
            will be removed from this event. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => remove.mutate({ participantId: participant.id, eventId })}
          >
            {remove.isPending ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Add form ──────────────────────────────────────────────────────────────────

type AddParticipantFormProps = {
  eventId: string;
};

function AddParticipantForm({ eventId }: AddParticipantFormProps) {
  const add = useAddParticipant(eventId);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddParticipantValues>({
    resolver: zodResolver(addParticipantSchema),
  });

  const onSubmit = async (values: AddParticipantValues) => {
    setServerError(null);
    try {
      await add.mutateAsync(values.email);
      reset();
    } catch (err: unknown) {
      const axiosMsg =
        err !== null &&
        typeof err === 'object' &&
        'response' in err &&
        err.response !== null &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data !== null &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof err.response.data.message === 'string'
          ? err.response.data.message
          : null;
      setServerError(axiosMsg ?? 'Could not add participant. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <Input
            {...register('email')}
            type="email"
            placeholder="colleague@company.com"
            className="w-72"
            disabled={add.isPending}
          />
          <Button type="submit" disabled={add.isPending} size="sm">
            {add.isPending ? 'Adding...' : '+ Add Attendee'}
          </Button>
        </div>
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
        {serverError && (
          <p className="text-xs text-destructive">{serverError}</p>
        )}
      </div>
    </form>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const ParticipantList = () => {
  const { eventId } = useParams({ from: '/admin/events/$eventId/participants' });
  const { data: participants = [], isLoading, isError } = useGetParticipants(eventId);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Participants</h1>
        <p className="text-sm text-muted-foreground">
          Add attendees by email. They will receive an invite link to complete
          their profile.
        </p>
      </div>

      <AddParticipantForm eventId={eventId} />

      {isError && (
        <p className="text-sm text-destructive">
          Could not load participants. Please try again.
        </p>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Passport</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableSkeleton />}

            {!isLoading && participants.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No participants yet. Add the first one by email above.
                </TableCell>
              </TableRow>
            )}

            {participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.full_name || (
                    <span className="text-muted-foreground italic">
                      Pending invite
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{p.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatLocation(p)}
                </TableCell>
                <TableCell>
                  <RsvpBadge status={p.rsvp_status} />
                </TableCell>
                <TableCell>
                  <PassportFlag hasPassport={!!p.google_uid} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <EditParticipantDialog participant={p} eventId={eventId} />
                    <RemoveButton participant={p} eventId={eventId} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && participants.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default ParticipantList;

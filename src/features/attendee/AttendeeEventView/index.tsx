import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactsCard from '@/components/ContactsCard';
import { Button } from '@/components/ui/button';
import EventHeader from '@/features/attendee/HumandRegistrationPage/components/EventHeader';
import { useAttendanceAction } from '@/hooks/useAttendanceAction';
import { useCompleteChecklistItem } from '@/hooks/useCompleteChecklistItem';
import { useDeleteParticipant } from '@/hooks/useDeleteParticipant';
import { useGetAttendeeEvents } from '@/hooks/useGetAttendeeEvents';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useGetEvent } from '@/hooks/useGetEvent';
import { useGetParticipantData } from '@/hooks/useGetParticipantData';
import { useUploadChecklistDocument } from '@/hooks/useUploadChecklistDocument';
import ChecklistCard from './components/ChecklistCard';
import DeleteDialog from './components/DeleteDialog';
import ProfileCard from './components/ProfileCard';
import RsvpStatusBanner from './components/RsvpStatusBanner';

type AttendeeEventViewProps = {
  eventId: string;
};

type LocalChecklistState = Record<
  string,
  { completed: boolean; value: string }
>;

const AttendeeEventView = ({ eventId }: AttendeeEventViewProps) => {
  const { t } = useTranslation('attendee');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: userLoading } = useGetCurrentUser();

  const email =
    sessionStorage.getItem('humand_attendee_email') ||
    currentUser?.email ||
    null;

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);
  const { data: contacts } = useGetContacts(eventId);
  const { data: participantData, isLoading: participantLoading } =
    useGetParticipantData(eventId, email);
  const { data: attendeeEvents } = useGetAttendeeEvents(email);

  // ── Auto-registration ──────────────────────────────────────────────────────
  const attendanceMutation = useAttendanceAction(eventId);
  const autoRegistered = useRef(false);

  useEffect(() => {
    if (
      participantData === null &&
      !participantLoading &&
      !autoRegistered.current &&
      currentUser &&
      !userLoading &&
      event
    ) {
      autoRegistered.current = true;
      const checklistItems = event.modules.checklist
        ? (event.checklist ?? [])
        : [];
      const hasRequiredChecklist = checklistItems.some((item) => item.required);

      attendanceMutation
        .mutateAsync({
          email: currentUser.email,
          full_name: currentUser.name,
          location_city: '',
          location_region: '',
          location_country: '',
          rsvpStatus: hasRequiredChecklist ? 'pending' : 'confirmed',
        })
        .then(() => {
          sessionStorage.setItem('humand_attendee_email', currentUser.email);
          queryClient.invalidateQueries({ queryKey: ['participant', eventId] });
          queryClient.invalidateQueries({ queryKey: ['events', eventId] });
        })
        .catch(() => {
          // error surfaced via attendanceMutation.isError
        });
    }
  }, [participantData, participantLoading, currentUser, userLoading, event]); // eventId and queryClient are stable refs

  // ── Checklist ──────────────────────────────────────────────────────────────
  const checklistMutation = useCompleteChecklistItem(eventId);
  const uploadMutation = useUploadChecklistDocument(eventId);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [localChecklist, setLocalChecklist] = useState<LocalChecklistState>({});
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (participantData && !initialized) {
      const init: LocalChecklistState = {};
      for (const item of participantData.checklist) {
        init[item.id] = { completed: item.completed, value: item.value ?? '' };
      }
      setLocalChecklist(init);
      setInitialized(true);
    }
  }, [participantData, initialized]);

  const handleSaveChecklist = async () => {
    if (!email || !participantData) return;
    setIsSaving(true);
    try {
      for (const item of participantData.checklist) {
        if (item.item_type === 'document_upload') continue;
        const local = localChecklist[item.id];
        if (!local) continue;
        console.log({ local });
        await checklistMutation.mutateAsync({
          email,
          checklist_item_id: item.id,
          completed: !!local.value,
          value: local.value || undefined,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpload = async (itemId: string, file: File) => {
    if (!email) return;
    setUploadingItemId(itemId);
    try {
      await uploadMutation.mutateAsync({
        email,
        checklist_item_id: itemId,
        file,
      });
    } finally {
      setUploadingItemId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteMutation = useDeleteParticipant(eventId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (!email) return;
    await deleteMutation.mutateAsync(email);
    setShowDeleteDialog(false);

    const otherEvents = (attendeeEvents ?? []).filter((e) => e.id !== eventId);
    if (otherEvents.length > 0) {
      navigate({ to: '/attendee/events' });
    } else {
      navigate({ to: '/join/$eventId', params: { eventId } });
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          {t('eventView.loading')}
        </p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-center text-sm text-muted-foreground">
          {t('eventView.noEmail')}
        </p>
      </div>
    );
  }

  if (eventLoading || participantLoading || attendanceMutation.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          {t('eventView.loading')}
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">
          {t('common.eventNotFound')}
        </p>
      </div>
    );
  }

  if (attendanceMutation.isError && participantData === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">
          {t('registration.submitError')}
        </p>
      </div>
    );
  }

  if (participantData === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          {t('eventView.loading')}
        </p>
      </div>
    );
  }

  if (!participantData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">
          {t('eventView.notFound')}
        </p>
      </div>
    );
  }

  const { participant, checklist } = participantData;
  const isConfirmed = participant.rsvp_status === 'confirmed';
  const hasInteractiveItems = checklist.some(
    (item) => item.item_type !== 'document_upload',
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <Link
          to="/attendee/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          {t('eventView.backToEvents')}
        </Link>

        <EventHeader event={event} />

        <RsvpStatusBanner isConfirmed={isConfirmed} />

        <ProfileCard
          participant={participant}
          eventId={eventId}
          email={email}
        />

        {event.modules.checklist && (
          <ChecklistCard
            checklist={checklist}
            localChecklist={localChecklist}
            setLocalChecklist={setLocalChecklist}
            isSaving={isSaving}
            hasInteractiveItems={hasInteractiveItems}
            onSave={handleSaveChecklist}
            onUpload={handleUpload}
            uploadingItemId={uploadingItemId}
          />
        )}

        {event.modules.contacts && (
          <div
            className="animate-appear-from-bottom"
            style={{ animationDelay: 'calc(4 * 50ms)' }}
          >
            <ContactsCard contacts={contacts ?? []} ns="attendee" />
          </div>
        )}

        <div
          className="animate-appear-from-bottom flex justify-end"
          style={{ animationDelay: 'calc(5 * 50ms)' }}
        >
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            {t('eventView.deleteButton')}
          </Button>
        </div>

        {showDeleteDialog && (
          <DeleteDialog
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleDelete}
            deleteMutation={deleteMutation}
          />
        )}
      </div>
    </div>
  );
};

export default AttendeeEventView;

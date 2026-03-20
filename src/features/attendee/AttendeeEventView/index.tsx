import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContactsCard from '@/components/ContactsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import EventHeader from '@/features/attendee/HumandRegistrationPage/components/EventHeader';
import { useAttendanceAction } from '@/hooks/useAttendanceAction';
import { useCompleteChecklistItem } from '@/hooks/useCompleteChecklistItem';
import { useDeleteParticipant } from '@/hooks/useDeleteParticipant';
import { useUploadChecklistDocument } from '@/hooks/useUploadChecklistDocument';
import { useGetAttendeeEvents } from '@/hooks/useGetAttendeeEvents';
import { useGetContacts } from '@/hooks/useGetContacts';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import { useGetEvent } from '@/hooks/useGetEvent';
import { useGetParticipantData } from '@/hooks/useGetParticipantData';
import type { ParticipantChecklistEntry } from '@/services/attendance';
import { attendanceService } from '@/services/attendance';

type AttendeeEventViewProps = {
  eventId: string;
};

type LocalChecklistState = Record<
  string,
  { completed: boolean; value: string }
>;

type ProfileValues = { city: string; region: string; country: string };

// ── Checklist item row ─────────────────────────────────────────────────────────

type ChecklistItemRowProps = {
  item: ParticipantChecklistEntry;
  index: number;
  localCompleted: boolean;
  localValue: string;
  onCompletedChange: (completed: boolean) => void;
  onValueChange: (value: string) => void;
  disabled: boolean;
  onUpload?: (file: File) => Promise<void>;
  uploading?: boolean;
};

const ChecklistItemRow = ({
  item,
  index,
  localCompleted,
  localValue,
  onCompletedChange,
  onValueChange,
  disabled,
  onUpload,
  uploading = false,
}: ChecklistItemRowProps) => {
  const { t } = useTranslation('attendee');

  const typeLabel: Record<ParticipantChecklistEntry['item_type'], string> = {
    checkbox: t('eventView.checklist.type.checkbox'),
    document_upload: t('eventView.checklist.type.document_upload'),
    info_input: t('eventView.checklist.type.info_input'),
  };

  return (
    <div
      className="animate-appear-from-bottom rounded-lg border bg-card px-4 py-3"
      style={{ animationDelay: `calc(${index} * 50ms)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-sm font-medium text-foreground">
            {item.label}
          </span>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              {typeLabel[item.item_type]}
            </Badge>
            {item.required && (
              <Badge variant="outline" className="text-xs">
                {t('eventView.checklist.required')}
              </Badge>
            )}
          </div>
        </div>

        {item.item_type === 'checkbox' && (
          <Checkbox
            checked={localCompleted}
            onCheckedChange={onCompletedChange}
            disabled={disabled}
            className="mt-0.5 shrink-0"
          />
        )}

        {item.item_type === 'document_upload' && item.completed && (
          <Badge variant="default" className="shrink-0 text-xs">
            {t('eventView.checklist.done')}
          </Badge>
        )}
      </div>

      {item.item_type === 'document_upload' && (
        <div className="mt-3 flex items-center gap-2">
          <label className="flex-1">
            <input
              type="file"
              className="hidden"
              disabled={disabled || uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUpload) {
                  onUpload(file).catch(() => {});
                  e.target.value = '';
                }
              }}
            />
            <span
              className={[
                'flex h-8 cursor-pointer items-center justify-center rounded-md border border-dashed px-3 text-xs transition-colors',
                disabled || uploading
                  ? 'cursor-not-allowed opacity-50'
                  : 'border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary',
              ].join(' ')}
            >
              {uploading
                ? t('eventView.checklist.uploading')
                : item.completed
                  ? t('eventView.checklist.reupload')
                  : t('eventView.checklist.upload')}
            </span>
          </label>
        </div>
      )}

      {item.item_type === 'info_input' && (
        <div className="mt-3">
          <Input
            value={localValue}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={t('registration.checklistAction.placeholder')}
            disabled={disabled}
            className="h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

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

  // ── Profile editing ────────────────────────────────────────────────────────
  const [profileValues, setProfileValues] = useState<ProfileValues>({
    city: '',
    region: '',
    country: '',
  });
  const [profileInitialized, setProfileInitialized] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (participantData && !profileInitialized) {
      const { location_city, location_region, location_country } =
        participantData.participant;
      setProfileValues({
        city: location_city ?? '',
        region: location_region ?? '',
        country: location_country ?? '',
      });
      setProfileInitialized(true);
      if (!location_city || !location_region || !location_country) {
        setEditingProfile(true);
      }
    }
  }, [participantData, profileInitialized]);

  const profileMutation = useMutation({
    mutationFn: () => {
      if (!participantData) throw new Error('No participant data');
      return attendanceService.profile(eventId, {
        email: participantData.participant.email,
        full_name: participantData.participant.full_name,
        location_city: profileValues.city,
        location_region: profileValues.region,
        location_country: profileValues.country,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant', eventId] });
      setEditingProfile(false);
      setProfileInitialized(false);
    },
  });

  // ── Checklist (registered view) ────────────────────────────────────────────
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
        await checklistMutation.mutateAsync({
          email,
          checklist_item_id: item.id,
          completed: local.completed,
          value: local.value || undefined,
        });
      }
    } finally {
      setIsSaving(false);
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
        <p className="text-sm text-muted-foreground">{t('eventView.loading')}</p>
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

  if (
    eventLoading ||
    participantLoading ||
    attendanceMutation.isPending
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('eventView.loading')}</p>
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

  // Auto-registration fired — waiting for the re-fetch to return data
  if (participantData === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('eventView.loading')}</p>
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
        <EventHeader event={event} />

        {/* RSVP status banner */}
        {isConfirmed ? (
          <div
            className="animate-appear-from-bottom rounded-xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-800 dark:bg-green-950"
            style={{ animationDelay: 'calc(1 * 50ms)' }}
          >
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
              {t('eventView.rsvpBanner.title')}
            </p>
            <p className="mt-0.5 text-sm text-green-700 dark:text-green-300">
              {t('eventView.rsvpBanner.subtitle')}
            </p>
          </div>
        ) : (
          <div
            className="animate-appear-from-bottom rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-950"
            style={{ animationDelay: 'calc(1 * 50ms)' }}
          >
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              {t('eventView.pendingBanner.title')}
            </p>
            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
              {t('eventView.pendingBanner.subtitle')}
            </p>
          </div>
        )}

        {/* Profile card */}
        <Card
          className="animate-appear-from-bottom"
          style={{ animationDelay: 'calc(2 * 50ms)' }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {t('eventView.profile.title')}
              </CardTitle>
              {!editingProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setEditingProfile(true)}
                >
                  {t('eventView.profile.edit')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Always-visible: name and email (from Google, read-only) */}
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  {t('eventView.profile.name')}
                </dt>
                <dd className="font-medium text-foreground">
                  {participant.full_name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  {t('eventView.profile.email')}
                </dt>
                <dd className="font-medium text-foreground">
                  {participant.email}
                </dd>
              </div>

              {/* Location — read-only when not editing */}
              {!editingProfile &&
                [
                  {
                    label: t('eventView.profile.city'),
                    value: participant.location_city,
                  },
                  {
                    label: t('eventView.profile.region'),
                    value: participant.location_region,
                  },
                  {
                    label: t('eventView.profile.country'),
                    value: participant.location_country,
                  },
                ]
                  .filter((row) => !!row.value)
                  .map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{row.label}</dt>
                      <dd className="font-medium text-foreground">
                        {row.value}
                      </dd>
                    </div>
                  ))}
            </dl>

            {/* Location — editable form */}
            {editingProfile && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {t('registration.fields.city.label')}
                  </label>
                  <Input
                    value={profileValues.city}
                    onChange={(e) =>
                      setProfileValues((p) => ({ ...p, city: e.target.value }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      {t('registration.fields.region.label')}
                    </label>
                    <Input
                      value={profileValues.region}
                      onChange={(e) =>
                        setProfileValues((p) => ({
                          ...p,
                          region: e.target.value,
                        }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">
                      {t('registration.fields.country.label')}
                    </label>
                    <Input
                      value={profileValues.country}
                      onChange={(e) =>
                        setProfileValues((p) => ({
                          ...p,
                          country: e.target.value,
                        }))
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingProfile(false);
                      setProfileValues({
                        city: participant.location_city ?? '',
                        region: participant.location_region ?? '',
                        country: participant.location_country ?? '',
                      });
                    }}
                    disabled={profileMutation.isPending}
                  >
                    {t('eventView.profile.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => profileMutation.mutate()}
                    disabled={profileMutation.isPending}
                  >
                    {profileMutation.isPending
                      ? t('eventView.profile.saving')
                      : t('eventView.profile.save')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        {event.modules.checklist && (
          <Card
            className="animate-appear-from-bottom"
            style={{ animationDelay: 'calc(3 * 50ms)' }}
          >
            <CardHeader>
              <CardTitle className="text-base">
                {t('eventView.checklist.title')}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t('eventView.checklist.subtitle')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('eventView.checklist.empty')}
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {checklist.map((item, index) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        index={index}
                        localCompleted={
                          localChecklist[item.id]?.completed ?? item.completed
                        }
                        localValue={
                          localChecklist[item.id]?.value ?? item.value ?? ''
                        }
                        onCompletedChange={(completed) =>
                          setLocalChecklist((prev) => ({
                            ...prev,
                            [item.id]: { ...prev[item.id], completed },
                          }))
                        }
                        onValueChange={(value) =>
                          setLocalChecklist((prev) => ({
                            ...prev,
                            [item.id]: { ...prev[item.id], value },
                          }))
                        }
                        disabled={isSaving}
                        onUpload={async (file) => {
                          if (!email) return;
                          setUploadingItemId(item.id);
                          try {
                            await uploadMutation.mutateAsync({
                              email,
                              checklist_item_id: item.id,
                              file,
                            });
                          } finally {
                            setUploadingItemId(null);
                          }
                        }}
                        uploading={uploadingItemId === item.id}
                      />
                    ))}
                  </div>
                  {hasInteractiveItems && (
                    <Button
                      className="w-full"
                      onClick={handleSaveChecklist}
                      disabled={isSaving}
                    >
                      {isSaving
                        ? t('eventView.checklist.saving')
                        : t('eventView.checklist.save')}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contacts */}
        {event.modules.contacts && (
          <div
            className="animate-appear-from-bottom"
            style={{ animationDelay: 'calc(4 * 50ms)' }}
          >
            <ContactsCard contacts={contacts ?? []} ns="attendee" />
          </div>
        )}

        {/* Delete registration */}
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

        {/* Delete confirmation dialog */}
        {showDeleteDialog && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowDeleteDialog(false)}
              aria-hidden="true"
            />
            <div className="relative mx-4 w-full max-w-sm rounded-xl bg-background p-6 shadow-lg">
              <h2 className="mb-2 text-base font-semibold text-foreground">
                {t('eventView.deleteDialog.title')}
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                {t('eventView.deleteDialog.description')}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleteMutation.isPending}
                >
                  {t('eventView.deleteDialog.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending
                    ? t('eventView.deleting')
                    : t('eventView.deleteDialog.confirm')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendeeEventView;

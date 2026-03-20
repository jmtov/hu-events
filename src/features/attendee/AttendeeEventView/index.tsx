import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetEvent } from '@/hooks/useGetEvent';
import { useGetParticipantData } from '@/hooks/useGetParticipantData';
import { useGetContacts } from '@/hooks/useGetContacts';
import ContactsCard from '@/components/ContactsCard';
import EventHeader from '@/features/attendee/HumandRegistrationPage/components/EventHeader';
import type { ParticipantChecklistEntry } from '@/services/attendance';

type AttendeeEventViewProps = {
  eventId: string;
  email: string | null;
};

type ChecklistItemRowProps = {
  item: ParticipantChecklistEntry;
  index: number;
};

const ChecklistItemRow = ({ item, index }: ChecklistItemRowProps) => {
  const { t } = useTranslation('attendee');

  const typeLabel: Record<ParticipantChecklistEntry['item_type'], string> = {
    checkbox: t('eventView.checklist.type.checkbox'),
    document_upload: t('eventView.checklist.type.document_upload'),
    info_input: t('eventView.checklist.type.info_input'),
  };

  return (
    <div
      className="animate-appear-from-bottom flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
      style={{ animationDelay: `calc(${index} * 50ms)` }}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm font-medium text-foreground">{item.label}</span>
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
      <Badge
        variant={item.completed ? 'default' : 'secondary'}
        className="shrink-0 text-xs"
      >
        {item.completed ? t('eventView.checklist.done') : t('eventView.checklist.pending')}
      </Badge>
    </div>
  );
};

const AttendeeEventView = ({ eventId, email }: AttendeeEventViewProps) => {
  const { t } = useTranslation('attendee');

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);
  const { data: contacts } = useGetContacts(eventId);
  const { data: participantData, isLoading: participantLoading } = useGetParticipantData(
    eventId,
    email,
  );

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-center text-sm text-muted-foreground">{t('eventView.noEmail')}</p>
      </div>
    );
  }

  if (eventLoading || participantLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('eventView.loading')}</p>
      </div>
    );
  }

  if (!event || !participantData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">{t('eventView.notFound')}</p>
      </div>
    );
  }

  const { participant, checklist } = participantData;

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <EventHeader event={event} />

        {/* RSVP confirmation banner */}
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

        {/* Submitted info */}
        <Card
          className="animate-appear-from-bottom"
          style={{ animationDelay: 'calc(2 * 50ms)' }}
        >
          <CardHeader>
            <CardTitle className="text-base">{t('eventView.profile.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {[
                { label: t('eventView.profile.name'), value: participant.full_name },
                { label: t('eventView.profile.email'), value: participant.email },
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
                    <dd className="font-medium text-foreground">{row.value}</dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>

        {/* Checklist */}
        {event.modules.checklist && (
          <div
            className="animate-appear-from-bottom space-y-3"
            style={{ animationDelay: 'calc(3 * 50ms)' }}
          >
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t('eventView.checklist.title')}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('eventView.checklist.subtitle')}
              </p>
            </div>
            {checklist.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('eventView.checklist.empty')}</p>
            ) : (
              <div className="space-y-2">
                {checklist.map((item, index) => (
                  <ChecklistItemRow key={item.id} item={item} index={index} />
                ))}
              </div>
            )}
          </div>
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
      </div>
    </div>
  );
};

export default AttendeeEventView;

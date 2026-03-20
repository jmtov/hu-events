import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetEvent } from '@/hooks/useGetEvent';
import { useGetCurrentUser } from '@/hooks/useGetCurrentUser';
import EventHeader from './components/EventHeader';

type HumandRegistrationPageProps = {
  eventId: string;
};

const HumandRegistrationPage = ({ eventId }: HumandRegistrationPageProps) => {
  const { t } = useTranslation('attendee');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: currentUser, isLoading: userLoading } = useGetCurrentUser();
  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);

  // Already authenticated — redirect to AttendeeEventView
  useEffect(() => {
    if (!userLoading && currentUser) {
      window.location.replace(`/attendee/events/${eventId}`);
    }
  }, [currentUser, userLoading]);

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    window.location.href = `/api/auth/google?redirectTo=/attendee/events/${eventId}`;
  };

  if (userLoading || eventLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">{t('common.eventNotFound')}</p>
      </div>
    );
  }

  // Show nothing while redirecting authenticated users
  if (currentUser) return null;

  const checklistItems = event.modules.checklist ? (event.checklist ?? []) : [];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl space-y-6">
        <EventHeader event={event} />

        <Card
          className="animate-appear-from-bottom"
          style={{ animationDelay: 'calc(1 * 50ms)' }}
        >
          <CardHeader>
            <CardTitle className="text-base">
              {t('registration.googleSignIn.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                {t('registration.preAuth.willNeedLabel')}
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground/60">•</span>
                  {t('registration.preAuth.items.name')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground/60">•</span>
                  {t('registration.preAuth.items.role')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground/60">•</span>
                  {t('registration.preAuth.items.location')}
                </li>
                {checklistItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">•</span>
                    {item.label}
                    {item.required && (
                      <Badge variant="outline" className="ml-1 text-xs">
                        {t('registration.checklist.required')}
                      </Badge>
                    )}{' '}
                    <Badge variant="secondary" className="text-xs">
                      {t(`registration.checklist.type.${item.item_type}`)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isRedirecting}
            >
              <IconBrandGoogle className="mr-2 h-4 w-4" />
              {isRedirecting
                ? t('registration.googleSignIn.redirecting')
                : t('registration.googleSignIn.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HumandRegistrationPage;

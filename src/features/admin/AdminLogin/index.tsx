import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

const AdminLogin = () => {
  const { t } = useTranslation('admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/events`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div
          className="animate-appear-from-bottom text-center"
          style={{ animationDelay: 'calc(0 * 50ms)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('login.brand')}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <Card
          className="animate-appear-from-bottom"
          style={{ animationDelay: 'calc(1 * 50ms)' }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{t('login.cardTitle')}</CardTitle>
            <CardDescription>{t('login.cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <IconBrandGoogle className="mr-2 h-4 w-4" />
              {isLoading ? t('login.signingIn') : t('login.signInWithGoogle')}
            </Button>
          </CardContent>
        </Card>

        <div
          className="animate-appear-from-bottom text-center"
          style={{ animationDelay: 'calc(2 * 50ms)' }}
        >
          <Link
            to="/attendee/login"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('login.attendeeAccess')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

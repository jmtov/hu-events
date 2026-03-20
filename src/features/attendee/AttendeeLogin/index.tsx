import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginSchema } from './constants';

type LoginValues = z.infer<typeof loginSchema>;

const AttendeeLogin = () => {
  const { t } = useTranslation('attendee');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit((values) => {
    sessionStorage.setItem('humand_attendee_email', values.email);
    router.navigate({ to: '/attendee/events' });
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="animate-appear-from-bottom text-center" style={{ animationDelay: 'calc(0 * 50ms)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('login.brand')}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">{t('login.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <div className="animate-appear-from-bottom text-center" style={{ animationDelay: 'calc(1 * 50ms)' }}>
          <Link
            to="/login"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('login.adminAccess')}
          </Link>
        </div>

        <Card className="animate-appear-from-bottom" style={{ animationDelay: 'calc(2 * 50ms)' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{t('login.email.label')}</CardTitle>
            <CardDescription>{t('login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t('login.email.label')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('login.email.placeholder')}
                  autoFocus
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('login.submitting') : t('login.submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendeeLogin;

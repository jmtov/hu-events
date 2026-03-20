import { useTranslation } from 'react-i18next';

type RsvpStatusBannerProps = {
  isConfirmed: boolean;
};

const RsvpStatusBanner = ({ isConfirmed }: RsvpStatusBannerProps) => {
  const { t } = useTranslation('attendee');

  if (isConfirmed) {
    return (
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
    );
  }

  return (
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
  );
};

export default RsvpStatusBanner;

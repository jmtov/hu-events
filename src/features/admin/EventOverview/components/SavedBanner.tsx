import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface SavedBannerProps {
  visible: boolean;
}

const SavedBanner = ({ visible }: SavedBannerProps) => {
  const { t } = useTranslation('admin');
  const [dismissed, setDismissed] = useState(false);

  if (!visible || dismissed) return null;

  return (
    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-green-800">
          {t('events.overview.savedBanner.title')}
        </span>
        <span className="text-green-700">
          {t('events.overview.savedBanner.subtitle')}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-green-700 hover:bg-green-100 hover:text-green-900"
        onClick={() => setDismissed(true)}
      >
        {t('events.overview.savedBanner.dismiss')}
      </Button>
    </div>
  );
};

export default SavedBanner;

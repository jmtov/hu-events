import { Button } from '@/components/ui/button';
import { IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

type SuccessScreenProps = {
  name: string;
  onBack: () => void;
};

const SuccessScreen = ({ name, onBack }: SuccessScreenProps) => {
  const { t } = useTranslation('attendee');

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
      <IconCircleCheck className="size-20 text-green-500" />
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {t('registration.success.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('registration.success.message', { name })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('registration.success.hint')}
        </p>
      </div>
      <Button variant="outline" onClick={onBack}>
        {t('registration.success.back')}
      </Button>
    </div>
  );
};

export default SuccessScreen;

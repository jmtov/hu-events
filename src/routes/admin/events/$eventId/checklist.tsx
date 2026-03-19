import { createFileRoute } from '@tanstack/react-router';
import ChecklistPage from '@/features/admin/EventConfigForm/components/ChecklistModule/ChecklistPage';

export const Route = createFileRoute('/admin/events/$eventId/checklist')({
  component: ChecklistPage,
});

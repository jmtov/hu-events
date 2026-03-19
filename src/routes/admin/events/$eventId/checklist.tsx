import { createFileRoute } from '@tanstack/react-router';
import ChecklistPage from '@/features/checklist';

export const Route = createFileRoute('/admin/events/$eventId/checklist')({
  component: ChecklistPage,
});

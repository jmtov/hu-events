import { createFileRoute } from '@tanstack/react-router';
import EventConfigForm from '@/features/admin/EventConfigForm';

// TODO (F-01): pre-populate EventConfigForm with existing event data
export const Route = createFileRoute('/admin/events/$eventId/edit')({
  component: EventConfigForm,
});

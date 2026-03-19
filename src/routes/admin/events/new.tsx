import { createFileRoute } from '@tanstack/react-router';
import EventConfigForm from '@/features/admin/EventConfigForm';

export const Route = createFileRoute('/admin/events/new')({
  component: EventConfigForm,
});

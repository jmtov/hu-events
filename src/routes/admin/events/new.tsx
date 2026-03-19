import { createFileRoute } from '@tanstack/react-router';
import EventCreateForm from '@/features/admin/EventCreateForm';

export const Route = createFileRoute('/admin/events/new')({
  component: EventCreateForm,
});

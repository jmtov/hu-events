import { createFileRoute } from '@tanstack/react-router';
import AdminEventList from '@/features/admin/AdminEventList';

export const Route = createFileRoute('/admin/events/')({
  component: AdminEventList,
});

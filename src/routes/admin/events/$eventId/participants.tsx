import { createFileRoute } from '@tanstack/react-router';
import ParticipantList from '@/features/participants/ParticipantList';

export const Route = createFileRoute('/admin/events/$eventId/participants')({
  component: ParticipantList,
});

import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { api } from '@/lib/api';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    try {
      await api.get('/auth/me');
    } catch {
      throw redirect({ to: '/login' });
    }
  },
  component: () => <Outlet />,
});

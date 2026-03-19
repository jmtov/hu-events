import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BudgetCategory, UpdateBudgetPayload } from '../../../src/types/budget.js';
import { readBudgets, writeBudgets } from '../../_lib/mock-store.js';

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { key: 'flights', label: 'Flights', enabled: false, ai_estimate: null, cap: null, is_custom: false },
  { key: 'accommodation', label: 'Accommodation', enabled: false, ai_estimate: null, cap: null, is_custom: false },
  { key: 'food', label: 'Food & Beverages', enabled: false, ai_estimate: null, cap: null, is_custom: false },
  { key: 'comms', label: 'Communications & Equipment', enabled: false, ai_estimate: null, cap: null, is_custom: false },
  { key: 'misc', label: 'Miscellaneous', enabled: false, ai_estimate: null, cap: null, is_custom: false },
];

/**
 * GET  /api/events/:eventId/budget  — load budget config for this event
 * PATCH /api/events/:eventId/budget  — save category toggles and caps
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string };

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    if (req.method === 'GET') {
      if (process.env.USE_MOCK_DATA === 'true') {
        const budgets = readBudgets();
        const budget = budgets.find((b) => b.event_id === eventId);

        if (budget) return res.status(200).json(budget);

        // Return default structure for events that haven't configured budget yet
        return res.status(200).json({
          event_id: eventId,
          currency: 'USD',
          categories: DEFAULT_CATEGORIES,
          updated_at: new Date().toISOString(),
        });
      }

      // TODO: query Supabase
      return res.status(501).json({ message: 'Not implemented' });
    }

    if (req.method === 'PATCH') {
      const { categories } = req.body as Partial<UpdateBudgetPayload>;

      if (!Array.isArray(categories)) {
        return res.status(400).json({ message: 'categories must be an array' });
      }

      if (process.env.USE_MOCK_DATA === 'true') {
        const budgets = readBudgets();
        const now = new Date().toISOString();
        const existing = budgets.find((b) => b.event_id === eventId);

        if (existing) {
          existing.categories = categories;
          existing.updated_at = now;
          writeBudgets(budgets);
          return res.status(200).json(existing);
        }

        const created = {
          event_id: eventId,
          currency: 'USD',
          categories,
          updated_at: now,
        };
        writeBudgets([...budgets, created]);
        return res.status(200).json(created);
      }

      // TODO: upsert into Supabase
      return res.status(501).json({ message: 'Not implemented' });
    }

    return res.status(405).end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}

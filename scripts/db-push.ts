/**
 * Inserts all fixture data into the Supabase database.
 *
 * Run with: npx tsx --env-file=.env.local scripts/db-push.ts
 *
 * Uses upsert (merge-duplicates) so it is safe to run multiple times.
 * For a full reset, run db-clean first: npm run db:reset
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { budgets } from '../api/_fixtures/budget';
import {
  checklistItems,
  contacts,
  events,
  participantChecklistItems,
  participantPreferences,
  participants,
  preferenceFields,
  triggerLog,
  triggers,
} from '../api/_fixtures/index';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.\n' +
      'Run with: npx tsx --env-file=.env.local scripts/db-push.ts',
  );
  process.exit(1);
}

const baseHeaders: Record<string, string> = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function upsert(table: string, rows: unknown[]): Promise<void> {
  if (rows.length === 0) {
    console.log(`  - ${table}: skipped (no rows)`);
    return;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...baseHeaders,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upsert ${table}: ${res.status} ${text}`);
  }

  console.log(`  ✓ ${table}: ${rows.length} rows`);
}

// ---------------------------------------------------------------------------
// Triggers: transform from frontend format to DB schema
// ---------------------------------------------------------------------------

type RawTrigger = {
  id: string;
  eventId: string;
  name: string;
  source: string;
  timing: string;
  timingValue: number;
  channel: string;
  recipient: string;
};

function resolveChecklistItemId(trigger: RawTrigger): string | null {
  if (trigger.source !== 'checklist') return null;
  const item = checklistItems.find(
    (ci) => ci.event_id === trigger.eventId && ci.label === trigger.name,
  );
  return item?.id ?? null;
}

function resolveMilestoneType(trigger: RawTrigger): string | null {
  if (trigger.source !== 'milestone') return null;
  if (trigger.name.includes('50%')) return 'rsvp_50';
  if (trigger.name.toLowerCase().includes('ended')) return 'event_ended';
  return null;
}

const triggersForDb = (triggers as RawTrigger[]).map((t) => ({
  id: t.id,
  event_id: t.eventId,
  source: t.source === 'checklist' ? 'checklist_item' : t.source,
  checklist_item_id: resolveChecklistItemId(t),
  milestone_type: resolveMilestoneType(t),
  timing_type: t.timing,
  timing_value: t.timing === 'immediately' ? null : t.timingValue,
  channel: t.channel,
  recipient: t.recipient,
  active: true,
}));

// ---------------------------------------------------------------------------
// Trigger log: keep only the columns that exist in the DB table
// ---------------------------------------------------------------------------

type RawTriggerLog = {
  id: string;
  trigger_id: string;
  fired_at: string;
  status: string;
  error: string | null;
  [key: string]: unknown;
};

const triggerLogForDb = (triggerLog as RawTriggerLog[]).map((log) => ({
  id: log.id,
  trigger_id: log.trigger_id,
  fired_at: log.fired_at,
  recipient_participant_id: null,
  status: log.status,
  error: log.error,
}));

// ---------------------------------------------------------------------------
// Budget config: map to budget_config table (stable id via index)
// ---------------------------------------------------------------------------

const budgetConfigForDb = budgets.map((b, i) => ({
  id: `00000008-0000-000${i + 1}-0000-000000000001`,
  event_id: b.event_id,
  currency: b.currency,
  categories: b.categories,
  updated_at: b.updated_at,
}));

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Pushing fixture data to Supabase…');

  // Insert in FK order: parents before children
  await upsert('events', events);
  await upsert('participants', participants);
  await upsert('preference_fields', preferenceFields);
  await upsert('participant_preferences', participantPreferences);
  await upsert('checklist_items', checklistItems);
  await upsert('participant_checklist_items', participantChecklistItems);
  await upsert('contacts', contacts);
  await upsert('budget_config', budgetConfigForDb);
  await upsert('triggers', triggersForDb);
  await upsert('trigger_log', triggerLogForDb);

  console.log('Done.');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

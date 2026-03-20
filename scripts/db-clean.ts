/**
 * Deletes all data from the Supabase database.
 *
 * Run with: npx tsx --env-file=.env.local scripts/db-clean.ts
 *
 * Deleting events is enough — all other tables cascade via ON DELETE CASCADE.
 *
 * Required env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    'Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.\n' +
      'Run with: npx tsx --env-file=.env.local scripts/db-clean.ts',
  );
  process.exit(1);
}

const headers: Record<string, string> = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function deleteAll(table: string): Promise<void> {
  // Use "id=not.is.null" — matches all rows since id is always set
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=not.is.null`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete from ${table}: ${res.status} ${text}`);
  }

  console.log(`  ✓ ${table}`);
}

async function main(): Promise<void> {
  console.log('Cleaning database…');

  // Deleting events cascades to:
  //   participants → participant_preferences, participant_checklist_items, receipts
  //   checklist_items → participant_checklist_items, triggers → trigger_log
  //   preference_fields, budget_config, contacts
  await deleteAll('events');

  console.log('Done. All tables are empty.');
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

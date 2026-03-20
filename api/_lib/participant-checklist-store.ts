import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { participantChecklistItems as seed } from '../_fixtures/checklist.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.resolve(__dirname, '../_fixtures/store/participant-checklist.json');

type StoredParticipantChecklistItem = {
  id: string;
  participant_id: string;
  checklist_item_id: string;
  completed: boolean;
  completed_at: string | null;
  document_url: string | null;
  value: string | null;
};

export function readParticipantChecklistItems(): StoredParticipantChecklistItem[] {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(raw) as StoredParticipantChecklistItem[];
  } catch {
    return seed as StoredParticipantChecklistItem[];
  }
}

export function writeParticipantChecklistItems(items: StoredParticipantChecklistItem[]): void {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(items, null, 2), 'utf-8');
}

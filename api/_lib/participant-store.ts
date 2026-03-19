import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { participants as seedParticipants } from '../_fixtures/participants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.resolve(__dirname, '../_fixtures/store/participants.json');

type StoredParticipant = (typeof seedParticipants)[number] & {
  id: string;
  event_id: string;
  full_name: string;
  google_uid: string | null;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  created_at: string;
  updated_at: string;
};

export function readParticipants(): StoredParticipant[] {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(raw) as StoredParticipant[];
  } catch {
    return seedParticipants as StoredParticipant[];
  }
}

export function writeParticipants(participants: StoredParticipant[]): void {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(participants, null, 2), 'utf-8');
}

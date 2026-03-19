import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { triggers as seedTriggers } from '../_fixtures/triggers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.resolve(__dirname, '../_fixtures/store/triggers.json')

export type StoredTrigger = {
  id: string
  eventId: string
  name: string
  source: 'milestone' | 'checklist'
  timing: 'immediately' | 'days_before' | 'hours_after'
  timingValue: number
  channel: 'slack' | 'email' | 'whatsapp'
  recipient: 'attendee' | 'hr_admin' | 'both'
}

export function readTriggers(): StoredTrigger[] {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8')
    return JSON.parse(raw) as StoredTrigger[]
  } catch {
    return seedTriggers as StoredTrigger[]
  }
}

export function writeTriggers(triggers: StoredTrigger[]): void {
  const dir = path.dirname(storePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify(triggers, null, 2), 'utf-8')
}

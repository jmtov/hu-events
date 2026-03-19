import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Event } from '../../src/types/event'
import type { PreferenceField } from '../../src/types/participant'
import { events as seedEvents } from '../_fixtures/events.js'
import { preferenceFields as seedPreferenceFields } from '../_fixtures/participants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Events store ─────────────────────────────────────────────────────────────

const eventsStorePath = path.resolve(__dirname, '../_fixtures/store/events.json')

export function readEvents(): Event[] {
  try {
    const raw = fs.readFileSync(eventsStorePath, 'utf-8')
    return JSON.parse(raw) as Event[]
  } catch {
    return seedEvents as Event[]
  }
}

export function writeEvents(events: Event[]): void {
  const dir = path.dirname(eventsStorePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(eventsStorePath, JSON.stringify(events, null, 2), 'utf-8')
}

// ─── Preference fields store ───────────────────────────────────────────────────

const prefFieldsStorePath = path.resolve(__dirname, '../_fixtures/store/preference-fields.json')

export function readPreferenceFields(): PreferenceField[] {
  try {
    const raw = fs.readFileSync(prefFieldsStorePath, 'utf-8')
    return JSON.parse(raw) as PreferenceField[]
  } catch {
    return seedPreferenceFields as PreferenceField[]
  }
}

export function writePreferenceFields(fields: PreferenceField[]): void {
  const dir = path.dirname(prefFieldsStorePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(prefFieldsStorePath, JSON.stringify(fields, null, 2), 'utf-8')
}

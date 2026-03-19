import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Event } from '../../src/types/event'
import { events as seedEvents } from '../_fixtures/events.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.resolve(__dirname, '../_fixtures/store/events.json')

export function readEvents(): Event[] {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8')
    return JSON.parse(raw) as Event[]
  } catch {
    return seedEvents as Event[]
  }
}

export function writeEvents(events: Event[]): void {
  const dir = path.dirname(storePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify(events, null, 2), 'utf-8')
}

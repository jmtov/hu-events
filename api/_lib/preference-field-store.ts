import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { preferenceFields as seedFields } from '../_fixtures/participants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.resolve(__dirname, '../_fixtures/store/preference-fields.json')

export type StoredPreferenceField = {
  id: string
  event_id: string
  label: string
  field_type: 'text' | 'select' | 'boolean'
  options: string[] | null
  required: boolean
  sort_order: number
}

export function readPreferenceFields(): StoredPreferenceField[] {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8')
    return JSON.parse(raw) as StoredPreferenceField[]
  } catch {
    return seedFields as StoredPreferenceField[]
  }
}

export function writePreferenceFields(fields: StoredPreferenceField[]): void {
  const dir = path.dirname(storePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify(fields, null, 2), 'utf-8')
}

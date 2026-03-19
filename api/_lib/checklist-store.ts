import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { checklistItems as seedItems } from '../_fixtures/checklist.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storePath = path.resolve(__dirname, '../_fixtures/store/checklist.json')

export type StoredChecklistItem = {
  id: string
  event_id: string
  label: string
  item_type: 'checkbox' | 'document_upload' | 'info_input'
  required: boolean
  alert_if_incomplete: boolean
  sort_order: number
}

export function readChecklistItems(): StoredChecklistItem[] {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8')
    return JSON.parse(raw) as StoredChecklistItem[]
  } catch {
    return seedItems as StoredChecklistItem[]
  }
}

export function writeChecklistItems(items: StoredChecklistItem[]): void {
  const dir = path.dirname(storePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(storePath, JSON.stringify(items, null, 2), 'utf-8')
}

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Budget } from '../../src/types/budget'
import type { Event } from '../../src/types/event'
import { budgets as seedBudgets } from '../_fixtures/budget.js'
import { events as seedEvents } from '../_fixtures/events.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Events ───────────────────────────────────────────────────────────────────

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

// ─── Budgets ──────────────────────────────────────────────────────────────────

const budgetsStorePath = path.resolve(__dirname, '../_fixtures/store/budget.json')

export function readBudgets(): Budget[] {
  try {
    const raw = fs.readFileSync(budgetsStorePath, 'utf-8')
    const parsed = JSON.parse(raw) as Budget[]
    return parsed.length > 0 ? parsed : (seedBudgets as Budget[])
  } catch {
    return seedBudgets as Budget[]
  }
}

export function writeBudgets(budgets: Budget[]): void {
  const dir = path.dirname(budgetsStorePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(budgetsStorePath, JSON.stringify(budgets, null, 2), 'utf-8')
}

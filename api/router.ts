import type { VercelRequest, VercelResponse } from '@vercel/node'

import adminEventsHandler from './_routes/admin/events.js'
import eventsIndexHandler from './_routes/events/index.js'
import eventHandler from './_routes/events/[eventId].js'
import eventChecklistHandler from './_routes/events/[eventId]/checklist.js'
import eventModulesHandler from './_routes/events/[eventId]/modules.js'
import eventParticipantsHandler from './_routes/events/[eventId]/participants.js'
import eventPreferenceFieldsHandler from './_routes/events/[eventId]/preference-fields.js'
import checklistItemHandler from './_routes/checklist/[itemId].js'
import participantHandler from './_routes/participants/[participantId].js'
import detectEventTypeHandler from './_routes/ai/detect-event-type.js'
import generateChecklistHandler from './_routes/ai/generate-checklist.js'
import suggestPreferenceFieldsHandler from './_routes/ai/suggest-preference-fields.js'

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>

type Route = {
  pattern: string[]
  handler: Handler
}

/**
 * Matches URL path segments against a pattern.
 * Segments starting with ":" are dynamic params — extracted and returned.
 * Returns null if the pattern doesn't match.
 */
function matchPath(
  pattern: string[],
  segments: string[],
): Record<string, string> | null {
  if (pattern.length !== segments.length) return null

  const params: Record<string, string> = {}
  for (let i = 0; i < pattern.length; i++) {
    const part = pattern[i]
    if (part.startsWith(':')) {
      params[part.slice(1)] = decodeURIComponent(segments[i])
    } else if (part !== segments[i]) {
      return null
    }
  }
  return params
}

const routes: Route[] = [
  { pattern: ['admin', 'events'],                            handler: adminEventsHandler },
  { pattern: ['events'],                                     handler: eventsIndexHandler },
  { pattern: ['events', ':eventId'],                         handler: eventHandler },
  { pattern: ['events', ':eventId', 'checklist'],            handler: eventChecklistHandler },
  { pattern: ['events', ':eventId', 'modules'],              handler: eventModulesHandler },
  { pattern: ['events', ':eventId', 'participants'],         handler: eventParticipantsHandler },
  { pattern: ['events', ':eventId', 'preference-fields'],    handler: eventPreferenceFieldsHandler },
  { pattern: ['checklist', ':itemId'],                       handler: checklistItemHandler },
  { pattern: ['participants', ':participantId'],              handler: participantHandler },
  { pattern: ['ai', 'detect-event-type'],                    handler: detectEventTypeHandler },
  { pattern: ['ai', 'generate-checklist'],                   handler: generateChecklistHandler },
  { pattern: ['ai', 'suggest-preference-fields'],            handler: suggestPreferenceFieldsHandler },
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url ?? ''
  const pathOnly = url.split('?')[0]

  // Strip leading /api prefix and split into segments
  const segments = pathOnly
    .replace(/^\/api\/?/, '')
    .split('/')
    .filter(Boolean)

  for (const route of routes) {
    const params = matchPath(route.pattern, segments)
    if (params !== null) {
      // Inject dynamic path params into req.query so handlers can read them normally
      Object.assign(req.query, params)
      return route.handler(req, res)
    }
  }

  return res.status(404).json({ message: 'Route not found' })
}

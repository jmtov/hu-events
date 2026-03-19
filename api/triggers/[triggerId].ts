import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { triggerId } = req.query as { triggerId: string }
  if (!triggerId) return res.status(400).json({ message: 'triggerId is required' })

  // n8n webhook integration to be added later
  return res.status(200).json({ ok: true, triggerId })
}

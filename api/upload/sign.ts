import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase.js'

const BUCKET = 'receipts'

/**
 * POST /api/upload/sign
 * Body: { path: string; contentType: string }
 * Returns: { signedUrl: string | null; path: string }
 *
 * In mock mode, returns signedUrl: null so the client skips the actual PUT.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { path: filePath, contentType } = req.body as {
    path?: string
    contentType?: string
  }

  if (!filePath) return res.status(400).json({ message: 'path is required' })
  if (!contentType) return res.status(400).json({ message: 'contentType is required' })

  if (process.env.USE_MOCK_DATA === 'true') {
    return res.status(200).json({ signedUrl: null, path: filePath })
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(filePath)

    if (error || !data) {
      return res.status(500).json({ message: error?.message ?? 'Failed to create signed URL' })
    }

    return res.status(200).json({ signedUrl: data.signedUrl, path: filePath })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}

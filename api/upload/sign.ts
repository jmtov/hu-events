import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { bucket, path, contentType } = req.body as {
    bucket?: string
    path?: string
    contentType?: string
  }

  if (!bucket?.trim()) return res.status(400).json({ message: 'bucket is required' })
  if (!path?.trim()) return res.status(400).json({ message: 'path is required' })
  if (!contentType?.trim()) return res.status(400).json({ message: 'contentType is required' })

  // Supabase Storage integration to be added later
  return res.status(200).json({
    signedUrl: `http://localhost:3000/mock-upload/${bucket}/${path}`,
    filePath: `${bucket}/${path}`,
  })
}

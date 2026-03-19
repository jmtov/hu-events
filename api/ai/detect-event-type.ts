import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are the intelligence engine for "Humand Events", a corporate event management platform.
Your task is to read a raw event description and classify the event type.
Strict rules:
1. Return ONLY a valid JSON object. No greetings, no \`\`\`json formatting, no explanations.
2. CRITICAL SAFETY RULE: If the description is gibberish, random characters, or anything that does not clearly describe a real corporate event, return exactly: { "event_type": "other" }. Do not invent or infer from invalid input.
Expected JSON structure: { "event_type": "one of: hr_retreat | bdr_call | hackathon | workshop | other" }`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { description } = req.body as { description?: string };
  if (!description?.trim()) {
    return res.status(400).json({ message: 'description is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: description.trim() }] }],
        generationConfig: { maxOutputTokens: 256, responseMimeType: 'application/json' },
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      const message =
        (data.error as { message?: string } | undefined)?.message ??
        `Gemini error (${response.status})`;
      return res.status(502).json({ message });
    }

    const text: string =
      (
        data.candidates as Array<{
          content: { parts: Array<{ text: string }> };
        }>
      )?.[0]?.content?.parts?.[0]?.text ?? '';

    const parsed: unknown = JSON.parse(text.trim());

    return res.status(200).json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}

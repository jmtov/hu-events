import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-20250514';

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ message: 'ANTHROPIC_API_KEY is not configured' });
  }

  try {
    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: description.trim() }],
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      const message =
        (data.error as { message?: string } | undefined)?.message ??
        `Anthropic error (${response.status})`;
      return res.status(502).json({ message });
    }

    const content = data.content;
    if (!Array.isArray(content))
      return res
        .status(502)
        .json({ message: 'Unexpected Anthropic response shape' });

    const text =
      content.find(
        (b): b is { type: 'text'; text: string } =>
          b !== null &&
          typeof b === 'object' &&
          (b as Record<string, unknown>).type === 'text',
      )?.text ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed: unknown = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}

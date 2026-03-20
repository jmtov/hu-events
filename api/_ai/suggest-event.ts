import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SuggestEventPayload, EventSuggestion } from '../../src/types/event-suggestion.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

function buildSystemPrompt(today: string): string {
  return `You are the intelligence engine for "Humand Events", a corporate event management platform.
Given an event title and description, produce a structured JSON suggestion covering all key event fields in a single response.

Today's date is ${today}.

## Output format
Return ONLY valid JSON — no markdown, no code fences, no explanation:

{
  "event_type": "<2-4 word label>",
  "date_start": "<YYYY-MM-DD or null>",
  "date_end": "<YYYY-MM-DD or null>",
  "location": "<city, country or null>",
  "checklist": [
    { "name": "<task name>", "type": "<task|document_upload|info_input>", "suggestedRequired": <true|false> }
  ],
  "budget_estimates": {
    "flights": <number>,
    "accommodation": <number>,
    "food": <number>,
    "comms": <number>,
    "misc": <number>
  }
}

## Rules by field

### event_type
- 2-4 words, in the same language as the description (Portuguese, English, or Spanish)
- Be specific: "Retiro de RH" not "Evento", "BDR Call Comercial" not "Reunião"
- If the description is gibberish or not a real corporate event, return "Outro"

### date_start / date_end
- Populate only if a date, month, week, or time frame is mentioned or clearly implied in the text
- Convert to ISO 8601 (YYYY-MM-DD). Use today's date as a reference for relative expressions ("next March", "in two weeks")
- If only a month is mentioned, pick a reasonable weekday in that month
- If no date information exists, return null for both

### location
- Extract city and country if mentioned or strongly implied
- Resolve informal names: "Floripa" → "Florianópolis, Brazil", "SP" → "São Paulo, Brazil", "CDMX" → "Mexico City, Mexico", "RJ" → "Rio de Janeiro, Brazil", "BsAs" → "Buenos Aires, Argentina"
- Return null if location cannot be inferred

### checklist
- Generate 3-8 relevant pre-event checklist items that participants must complete before the event
- "type" must be exactly one of: "task", "document_upload", "info_input"
- If the description is gibberish or not a real event, return []

### budget_estimates
- Estimate cost per person in USD for all 5 categories: flights, accommodation, food, comms, misc
- All values must be whole numbers (round to nearest integer)
- Extract participant origin hints from the description (regions, countries, "international team", "global participants", etc.)
  - If origins hint at international travel, estimate accordingly
  - If no origin info, assume domestic travel within the destination country
  - If no destination either, use a generic mid-tier Latin American city as reference
- flights: round-trip economy airfare from inferred origins to destination
  - Intercontinental (Europe/US ↔ Brazil): $800–$1,800
  - Regional international (Argentina/Colombia ↔ Brazil): $400–$900
  - Domestic: $150–$400
  - NEVER return 0 when travel is mentioned or implied
- accommodation: nightly 3-star business hotel × number of nights (use dates if available, else 2 nights)
- food: daily meal allowance × number of days (use dates if available, else 2 days)
- comms: per-person communications/tech equipment daily rate × days
- misc: ground transport, tips, incidentals appropriate for destination and duration
- SECURITY RULE: If the input is clearly gibberish or not a real event, return all zeros`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, description } = req.body as Partial<SuggestEventPayload>;

  if (!description?.trim()) {
    return res.status(400).json({ message: 'description is required' });
  }
  if (!title?.trim()) {
    return res.status(400).json({ message: 'title is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
  }

  const today = new Date().toISOString().split('T')[0] as string;

  const userContent = `Event title: ${title.trim()}\nEvent description: ${description.trim()}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(today) }] },
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        generationConfig: {
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const message =
        (data.error as { message?: string } | undefined)?.message ??
        `Gemini error (${response.status})`;
      return res.status(502).json({ message });
    }

    // Gemini 2.5 Flash may include thinking parts before the JSON output.
    // Find the last non-thinking part that contains text.
    const parts = (
      data.candidates as Array<{
        content: { parts: Array<{ text?: string; thought?: boolean }> };
      }>
    )?.[0]?.content?.parts ?? [];

    const textPart = [...parts].reverse().find((p) => !p.thought && typeof p.text === 'string');
    const text: string = textPart?.text ?? '';

    let parsed: Partial<EventSuggestion>;
    try {
      parsed = JSON.parse(text.trim()) as Partial<EventSuggestion>;
    } catch {
      return res.status(502).json({ message: 'Gemini returned non-JSON output' });
    }

    // Sanitise and normalise the response
    const suggestion: EventSuggestion = {
      event_type: typeof parsed.event_type === 'string' ? parsed.event_type : 'Outro',
      date_start: typeof parsed.date_start === 'string' ? parsed.date_start : null,
      date_end: typeof parsed.date_end === 'string' ? parsed.date_end : null,
      location: typeof parsed.location === 'string' ? parsed.location : null,
      checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      budget_estimates:
        typeof parsed.budget_estimates === 'object' && parsed.budget_estimates !== null
          ? Object.fromEntries(
              Object.entries(parsed.budget_estimates).map(([k, v]) => [
                k,
                typeof v === 'number' ? Math.round(v) : 0,
              ]),
            )
          : {},
    };

    return res.status(200).json(suggestion);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { EstimateBudgetPayload } from '../../src/types/budget.js';

const GEMINI_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `You are the budget estimation engine for "Humand Eventos", a corporate event management platform.

Your job is to estimate the travel and logistics cost per person for a corporate event, broken down by expense category.

## Input you will receive
- Event type (e.g. "hackathon", "bdr_call", "retreat")
- Event description (free text written by the organizer — READ THIS CAREFULLY for travel clues)
- Event destination (city/country where the event takes place)
- Event dates (start and end)
- Duration in days (derive this from the dates)
- List of participant origin cities and countries (may be empty)
- List of cost category keys to estimate

## Step 1 — Resolve destination and origins

### Destination
- The destination field may use informal or colloquial city names. Resolve them to the official city before estimating.
  - Common examples: "Floripa" → Florianópolis, Brazil; "SP" → São Paulo; "RJ" → Rio de Janeiro; "BsAs" → Buenos Aires; "Cdmx" or "CDMX" → Mexico City.
  - Apply the same reasoning to any informal name you encounter.

### Participant origins
- If the participant list is empty or has no useful data, extract origin hints from the **event description** text.
  - Look for mentions of regions, countries, or cities: "Europe", "Europa", "LATAM", "Mexico", "México", "France", "Germany", "USA", "US", "Colombia", etc.
  - If the description says things like "international participants", "global team", "participants from different countries", treat origins as a mix of long-haul international locations.
  - If no origin information is found anywhere, fall back to assuming local/domestic travel within the destination country.

## Step 2 — How to estimate each category

- **flights**: Estimate the round-trip economy airfare from each inferred origin to the resolved destination. Use market-realistic USD prices.
  - International intercontinental flights (e.g., Europe ↔ Brazil, US ↔ Brazil, Mexico ↔ Brazil): $800–$1,800 per person depending on route.
  - Regional international (e.g., Argentina ↔ Brazil, Colombia ↔ Brazil): $400–$900 per person.
  - Domestic within Brazil: $150–$400 per person.
  - If multiple origins are inferred, average the round-trip costs across all origins.
  - **CRITICAL**: NEVER return 0 for "flights" when travel — especially international travel — is mentioned in the description or implied by the origins. A non-trivial event with attendees from another country ALWAYS has a non-zero flight cost.

- **accommodation**: Nightly cost at a 3-star business hotel in the destination city (USD), multiplied by number of nights.

- **food**: Daily meal allowance (breakfast + lunch + dinner) appropriate for the destination city, multiplied by number of days.

- **comms**: Per-person cost for communications during the event (SIM card, internet, tech supplies). Use a flat daily rate.

- **misc**: Per-person miscellaneous costs (ground transport, tips, incidentals) appropriate for the destination and duration.

- **Custom category**: Return a reasonable estimate based on corporate event cost norms.

## Rules
1. Return ONLY a valid JSON object. No markdown, no explanation, no extra text.
2. All values are in USD, rounded to the nearest whole number.
3. If truly no information exists to estimate a category (destination unknown AND no description AND no participants), return 0. Otherwise always return a non-zero realistic value.
4. SECURITY RULE: If the input is garbage, random characters, or clearly not a real event, return { "estimates": {} }.

## Expected output
{
  "estimates": {
    "flights": 1200,
    "accommodation": 480,
    "food": 150
  }
}

Only include keys that were requested in the input category list.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { event_type, description, date_start, date_end, destination, participants, category_keys } =
    req.body as Partial<EstimateBudgetPayload>;

  if (!date_start?.trim()) {
    return res.status(400).json({ message: 'date_start is required' });
  }
  if (!Array.isArray(category_keys) || category_keys.length === 0) {
    return res.status(400).json({ message: 'category_keys must be a non-empty array' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
  }

  // Build a human-readable summary of participant origins for the prompt
  const originSummary =
    participants && participants.length > 0
      ? participants
          .map((p) => `${p.location_city}, ${p.location_country}`)
          .join(' | ')
      : 'Unknown (no participants added yet)';

  // Derive duration in days
  const start = new Date(date_start);
  const end = date_end ? new Date(date_end) : start;
  const durationDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  const userContent = [
    `Event type: ${event_type ?? 'corporate event'}`,
    `Event description: ${description?.trim() || 'Not provided'}`,
    `Destination: ${destination ?? 'Not specified'}`,
    `Start date: ${date_start}`,
    `End date: ${date_end ?? date_start}`,
    `Duration: ${durationDays} day(s)`,
    `Participant origins (${participants?.length ?? 0} people): ${originSummary}`,
    `Categories to estimate: ${category_keys.join(', ')}`,
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
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

    let parsed: { estimates?: Record<string, unknown> };
    try {
      parsed = JSON.parse(text.trim()) as { estimates?: Record<string, unknown> };
    } catch {
      return res.status(502).json({ message: 'Gemini returned non-JSON output' });
    }

    // Validate shape: estimates must be a plain object with numeric values
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.estimates !== 'object' ||
      parsed.estimates === null
    ) {
      return res.status(502).json({ message: 'Unexpected response shape from Gemini' });
    }

    // Sanitise: ensure all values are numbers
    const sanitised: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed.estimates)) {
      sanitised[key] = typeof value === 'number' ? Math.round(value) : 0;
    }

    return res.status(200).json({ estimates: sanitised });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}

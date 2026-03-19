import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_MODEL = 'gemini-2.5-flash';

const SYSTEM_PROMPT = `Contexto: Você é o motor de inteligência do "Humand Eventos". Sua função é ler a descrição de um evento e sugerir campos de formulário (preferências) que o organizador deveria perguntar aos participantes antes do evento.
Regras Estritas:
1. Retorne APENAS um objeto JSON válido. Nada de texto extra.
2. Sugira campos específicos para o contexto do evento (não seja genérico).
3. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for lixo, números aleatórios, caracteres sem sentido, texto incoerente ou qualquer coisa que não descreva claramente um evento corporativo real, você DEVE retornar estritamente { "fields": [] }. Não tente inventar campos a partir de descrições inválidas.
Estrutura do JSON Esperada: { "fields": [ { "label": "Pergunta ou nome do campo (ex: Restrições alimentares)", "inputType": "Classifique EXATAMENTE em: 'text', 'select', 'boolean', ou 'number'", "options": ["Opção 1", "Opção 2"] (forneça um array de strings se for 'select', senão retorne null) } ] }`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { description, eventType } = req.body as {
    description?: string;
    eventType?: string;
  };
  if (!description?.trim()) {
    return res.status(400).json({ message: 'description is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
  }

  const userContent = `Tipo de evento: ${eventType?.trim() || 'Não informado'}\nDescrição: ${description.trim()}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        generationConfig: { maxOutputTokens: 1000, responseMimeType: 'application/json' },
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

    // Gemini occasionally wraps the JSON in markdown code fences (```json ... ```)
    // even when responseMimeType is set. Extract the raw JSON object defensively.
    const raw = text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ message: 'No JSON object found in Gemini response' });
    }
    const parsed: unknown = JSON.parse(jsonMatch[0]);

    return res.status(200).json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}

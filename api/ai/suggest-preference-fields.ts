import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-20250514';

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ message: 'ANTHROPIC_API_KEY is not configured' });
  }

  const userContent = `Tipo de evento: ${eventType?.trim() || 'Não informado'}\nDescrição: ${description.trim()}`;

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
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
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

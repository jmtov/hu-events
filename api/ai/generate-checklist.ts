import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `Contexto: Você é o motor de inteligência do "Humand Eventos". Sua função é ler a descrição de um evento (e seu tipo opcional) e gerar um checklist pré-evento com as tarefas que os participantes precisam cumprir.
Regras Estritas:
1. Você deve retornar ÚNICA e EXCLUSIVAMENTE um objeto JSON válido.
2. Não inclua saudações, não inclua a formatação \`\`\`json, não explique sua resposta. Apenas o JSON puro.
3. Gere entre 3 e 8 itens relevantes para o evento.
4. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for lixo, números aleatórios, caracteres sem sentido, texto incoerente ou qualquer coisa que não descreva claramente um evento corporativo real, você DEVE retornar estritamente { "items": [] }. Não tente inventar ou inferir tarefas a partir de descrições inválidas.
Estrutura do JSON Esperada (Contrato): { "items": [ { "name": "Nome descritivo da tarefa (ex: Enviar passaporte, Confirmar tamanho da camiseta)", "type": "Classifique EXATAMENTE em um destes três: 'task', 'document_upload', ou 'info_input'", "suggestedRequired": true ou false } ] }`;

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

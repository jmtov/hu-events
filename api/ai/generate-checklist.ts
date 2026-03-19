import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_MODEL = 'gemini-2.0-flash';

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
        generationConfig: { maxOutputTokens: 1000 },
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

    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed: unknown = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}

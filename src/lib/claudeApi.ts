/**
 * Shared Claude API wrapper for Humand Eventos.
 * All functions call /api/claude (Vercel serverless) so the API key
 * stays server-side and never reaches the browser.
 */

const MODEL = "claude-opus-4-6";
const ENDPOINT = "/api/claude";

async function callClaude(system: string, userMessage: string): Promise<string> {
	const res = await fetch(ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: MODEL,
			max_tokens: 1024,
			system,
			messages: [{ role: "user", content: userMessage }],
		}),
	});

	if (!res.ok) {
		throw new Error(`API error: ${res.status}`);
	}

	const data = await res.json();
	const text: string =
		data.content
			?.filter((b: { type: string }) => b.type === "text")
			.map((b: { text: string }) => b.text)
			.join("") ?? "";

	return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventType =
	| "Offsite"
	| "Hackathon"
	| "Treinamento"
	| "Confraternização"
	| "Viagem Corporativa"
	| "Palestra"
	| "Outro";

export type LocationType = "Presencial" | "Remoto" | "Híbrido";

export interface DetectedEvent {
	suggested_title: string;
	event_type: EventType;
	location_type: LocationType;
	is_travel_required: boolean;
}

export interface ChecklistItem {
	name: string;
	type: "task" | "document_upload" | "info_input";
	suggestedRequired: boolean;
}

export interface Checklist {
	items: ChecklistItem[];
}

export interface PreferenceField {
	label: string;
	inputType: "text" | "select" | "boolean" | "number";
	options: string[] | null;
}

export interface PreferenceFields {
	fields: PreferenceField[];
}

export interface BudgetCategory {
	category: string;
	amount_min: number;
	amount_max: number;
	notes: string;
}

export interface BudgetEstimate {
	currency: "BRL";
	total_min: number;
	total_max: number;
	per_person_min: number | null;
	per_person_max: number | null;
	breakdown: BudgetCategory[];
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Classifies a free-text event description into a structured event object.
 */
export async function detectEventType(description: string): Promise<DetectedEvent> {
	const system = `Contexto: Você é o motor de inteligência do "Humand Eventos", um aplicativo corporativo. Sua função é ler a descrição crua de um evento fornecida por um usuário (geralmente do RH ou gestor) e classificar esse evento.
Regras Estritas:
1. Você deve retornar ÚNICA e EXCLUSIVAMENTE um objeto JSON válido.
2. Não inclua saudações, não inclua a formatação \`\`\`json, não explique sua resposta. Apenas o JSON puro.
3. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for lixo, números aleatórios, caracteres sem sentido, texto incoerente ou qualquer coisa que não descreva claramente um evento corporativo real, você DEVE retornar exatamente: { "suggested_title": "Descrição Inválida", "event_type": "Outro", "location_type": "Presencial", "is_travel_required": false }. Não tente inventar ou inferir um evento a partir de descrições inválidas.
Estrutura do JSON Esperada (Contrato): { "suggested_title": "Título curto e profissional para o evento", "event_type": "Classifique em uma destas opções: [Offsite, Hackathon, Treinamento, Confraternização, Viagem Corporativa, Palestra, Outro]", "location_type": "Classifique em: [Presencial, Remoto, Híbrido]", "is_travel_required": true ou false }`;

	return callClaude(system, description) as Promise<DetectedEvent>;
}

/**
 * Generates a pre-event checklist of tasks for participants.
 */
export async function generateChecklist(
	description: string,
	eventType?: string,
): Promise<Checklist> {
	const system = `Contexto: Você é o motor de inteligência do "Humand Eventos". Sua função é ler a descrição de um evento (e seu tipo opcional) e gerar um checklist pré-evento com as tarefas que os participantes precisam cumprir.
Regras Estritas:
1. Você deve retornar ÚNICA e EXCLUSIVAMENTE um objeto JSON válido.
2. Não inclua saudações, não inclua a formatação \`\`\`json, não explique sua resposta. Apenas o JSON puro.
3. Gere entre 3 e 8 itens relevantes para o evento.
4. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for lixo, números aleatórios, caracteres sem sentido, texto incoerente ou qualquer coisa que não descreva claramente um evento corporativo real, você DEVE retornar estritamente { "items": [] }. Não tente inventar ou inferir tarefas a partir de descrições inválidas.
Estrutura do JSON Esperada (Contrato): { "items": [ { "name": "Nome descritivo da tarefa (ex: Enviar passaporte, Confirmar tamanho da camiseta)", "type": "Classifique EXATAMENTE em um destes três: 'task', 'document_upload', ou 'info_input'", "suggestedRequired": true ou false } ] }`;

	const userMessage = `Tipo de evento: ${eventType ?? "Não informado"}\nDescrição: ${description}`;
	return callClaude(system, userMessage) as Promise<Checklist>;
}

/**
 * Suggests preference form fields to collect from participants before the event.
 */
export async function suggestPreferenceFields(
	description: string,
	eventType?: string,
): Promise<PreferenceFields> {
	const system = `Contexto: Você é o motor de inteligência do "Humand Eventos". Sua função é ler a descrição de um evento e sugerir campos de formulário (preferências) que o organizador deveria perguntar aos participantes antes do evento.
Regras Estritas:
1. Retorne APENAS um objeto JSON válido. Nada de texto extra.
2. Sugira campos específicos para o contexto do evento (não seja genérico).
3. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for lixo, números aleatórios, caracteres sem sentido, texto incoerente ou qualquer coisa que não descreva claramente um evento corporativo real, você DEVE retornar estritamente { "fields": [] }. Não tente inventar campos a partir de descrições inválidas.
Estrutura do JSON Esperada: { "fields": [ { "label": "Pergunta ou nome do campo (ex: Restrições alimentares)", "inputType": "Classifique EXATAMENTE em: 'text', 'select', 'boolean', ou 'number'", "options": ["Opção 1", "Opção 2"] (forneça um array de strings se for 'select', senão retorne null) } ] }`;

	const userMessage = `Tipo de evento: ${eventType ?? "Não informado"}\nDescrição: ${description}`;
	return callClaude(system, userMessage) as Promise<PreferenceFields>;
}

/**
 * Estimates a budget range (in BRL) for the event broken down by category.
 * @param description  Free-text event description
 * @param eventType    Optional event type (e.g. "Offsite")
 * @param participants Optional number of participants
 */
export async function estimateBudget(
	description: string,
	eventType?: string,
	participants?: number,
): Promise<BudgetEstimate> {
	const system = `Contexto: Você é o motor de inteligência do "Humand Eventos", especializado em orçamentos de eventos corporativos no Brasil.
Sua função é estimar um orçamento realista em BRL (Reais) com base na descrição do evento.
Regras Estritas:
1. Retorne APENAS um objeto JSON válido. Nenhum texto extra, nenhuma formatação \`\`\`json.
2. Use valores de mercado brasileiros atuais e realistas.
3. Forneça sempre um intervalo (mínimo e máximo) para refletir variações de fornecedor.
4. Se o número de participantes for informado, inclua estimativas per capita (per_person_min e per_person_max). Caso contrário, retorne null nos campos per capita.
5. Categorias típicas a considerar (inclua apenas as relevantes para o evento): Hospedagem, Alimentação, Transporte, Aluguel de Espaço, Equipamentos/AV, Atividades/Entretenimento, Brindes/Materiais, Serviços (fotografia, segurança etc.), Contingência.
6. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for inválida ou incoerente, retorne: { "currency": "BRL", "total_min": 0, "total_max": 0, "per_person_min": null, "per_person_max": null, "breakdown": [] }.
Estrutura do JSON Esperada:
{
  "currency": "BRL",
  "total_min": <number>,
  "total_max": <number>,
  "per_person_min": <number | null>,
  "per_person_max": <number | null>,
  "breakdown": [
    {
      "category": "<nome da categoria>",
      "amount_min": <number>,
      "amount_max": <number>,
      "notes": "<breve justificativa ou premissa>"
    }
  ]
}`;

	const parts = [
		`Tipo de evento: ${eventType ?? "Não informado"}`,
		`Número de participantes: ${participants != null ? participants : "Não informado"}`,
		`Descrição: ${description}`,
	];

	return callClaude(system, parts.join("\n")) as Promise<BudgetEstimate>;
}

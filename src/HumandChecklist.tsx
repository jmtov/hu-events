import { useState } from "react";

type ContentBlock = { type: string; text: string };
type ChecklistItem = { name: string; type: string; suggestedRequired: boolean };
type ChecklistResult = { items: ChecklistItem[] };
type Counts = { task: number; document_upload: number; info_input: number; required: number };

const SYSTEM_PROMPT = `Contexto: Você é o motor de inteligência do "Humand Eventos". Sua função é ler a descrição de um evento (e seu tipo opcional) e gerar um checklist pré-evento com as tarefas que os participantes precisam cumprir.
Regras Estritas:
1. Você deve retornar ÚNICA e EXCLUSIVAMENTE um objeto JSON válido.
2. Não inclua saudações, não inclua a formatação \`\`\`json, não explique sua resposta. Apenas o JSON puro.
3. Gere entre 3 e 8 itens relevantes para o evento.
4. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for lixo, números aleatórios, caracteres sem sentido, texto incoerente ou qualquer coisa que não descreva claramente um evento corporativo real, você DEVE retornar estritamente { "items": [] }. Não tente inventar ou inferir tarefas a partir de descrições inválidas.
Estrutura do JSON Esperada (Contrato): { "items": [ { "name": "Nome descritivo da tarefa (ex: Enviar passaporte, Confirmar tamanho da camiseta)", "type": "Classifique EXATAMENTE em um destes três: 'task', 'document_upload', ou 'info_input'", "suggestedRequired": true ou false } ] }`;

const TYPE_CONFIG = {
  task:            { label: "Tarefa",       icon: "✅", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  document_upload: { label: "Envio de Doc.", icon: "📎", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  info_input:      { label: "Informação",   icon: "✏️", bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
};

const EVENT_TYPES = ["Offsite", "Hackathon", "Treinamento", "Confraternização", "Viagem Corporativa", "Palestra", "Outro"];

export default function App() {
  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ChecklistResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toggled, setToggled] = useState<Record<number, boolean>>({});

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true); setResult(null); setError(""); setToggled({});
    try {
      const userMsg = `Tipo de evento: ${eventType || "Não informado"}\nDescrição: ${description}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const text = data.content?.filter((b: ContentBlock) => b.type === "text").map((b: ContentBlock) => b.text).join("") || "";
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setError("Erro ao gerar o checklist. Verifique a descrição e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setDescription(""); setEventType(""); setResult(null); setError(""); setToggled({}); };
  const toggleRequired = (i: number) => setToggled(p => ({ ...p, [i]: !p[i] }));
  const getRequired = (i: number, item: ChecklistItem) => (i in toggled ? toggled[i] : item.suggestedRequired);

  const counts: Counts | null = result && result.items.length > 0 ? {
    task:            result.items.filter((it: ChecklistItem) => it.type === "task").length,
    document_upload: result.items.filter((it: ChecklistItem) => it.type === "document_upload").length,
    info_input:      result.items.filter((it: ChecklistItem) => it.type === "info_input").length,
    required:        result.items.filter((it: ChecklistItem, i: number) => getRequired(i, it)).length,
  } : null;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f8fafc", padding: "32px 16px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>

        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#1e293b", borderRadius: 12, padding: "10px 20px", marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>📋</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>Humand Eventos</span>
          </div>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Gerador de checklist pré-evento</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24, marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 8 }}>
              Tipo de evento <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opcional)</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EVENT_TYPES.map(t => (
                <button key={t} onClick={() => setEventType(eventType === t ? "" : t)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  border: eventType === t ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
                  background: eventType === t ? "#eef2ff" : "#fff",
                  color: eventType === t ? "#4f46e5" : "#64748b",
                }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 8 }}>Descrição do evento</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={loading}
              placeholder="Ex: Vamos levar 40 colaboradores para um offsite de 3 dias em Campos do Jordão. Haverá transporte de van saindo de SP, hospedagem em pousada compartilhada e atividades ao ar livre..."
              style={{ width: "100%", minHeight: 120, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", background: loading ? "#f8fafc" : "#fff" }}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={generate} disabled={loading || !description.trim()} style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: loading || !description.trim() ? "#c7d2fe" : "#6366f1",
              color: "#fff", fontWeight: 600, fontSize: 14,
              cursor: loading || !description.trim() ? "not-allowed" : "pointer",
            }}>{loading ? "Gerando checklist..." : "✨ Gerar Checklist"}</button>
            {(result || description) && (
              <button onClick={reset} style={{ padding: "11px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Limpar</button>
            )}
          </div>
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", color: "#b91c1c", fontSize: 14 }}>⚠️ {error}</div>}

        {loading && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < 4 ? 16 : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f1f5f9", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 14, borderRadius: 6, background: "#f1f5f9", width: `${60 + i * 8}%`, marginBottom: 6 }} />
                  <div style={{ height: 11, borderRadius: 6, background: "#f1f5f9", width: "35%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {result && !loading && (
          <div style={{ animation: "fadeIn .4s ease" }}>
            {result.items.length === 0 ? (
              /* ── Empty / invalid state ── */
              <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: "36px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🤔</div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", margin: "0 0 8px" }}>Descrição não reconhecida</p>
                <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.6 }}>
                  A descrição não parece descrever um evento corporativo válido.<br />Tente detalhar melhor o evento.
                </p>
                <button onClick={reset} style={{ padding: "9px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Tentar novamente
                </button>
              </div>
            ) : (
              /* ── Valid checklist ── */
              <>
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15 }}>📋</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>{result!.items.length} itens gerados</span>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>·</span>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{counts!.required} obrigatórios</span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => counts![k as keyof Counts] > 0 && (
                      <span key={k} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: v.bg, color: v.color, border: `1px solid ${v.border}` }}>
                        {v.icon} {counts![k as keyof Counts]} {v.label}
                      </span>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 12 }}>
                  Clique no ícone de cadeado para alterar a obrigatoriedade sugerida
                </p>

                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                  {result!.items.map((item: ChecklistItem, i: number) => {
                    const cfg = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.task;
                    const req = getRequired(i, item);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i < result!.items.length - 1 ? "1px solid #f1f5f9" : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                          {cfg.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1e293b", lineHeight: 1.4 }}>{item.name}</p>
                          <span style={{ fontSize: 12, fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <button onClick={() => toggleRequired(i)} style={{
                          display: "flex", alignItems: "center", gap: 5, padding: "5px 10px",
                          borderRadius: 20, border: `1.5px solid ${req ? "#fde68a" : "#e2e8f0"}`,
                          background: req ? "#fffbeb" : "#f8fafc", cursor: "pointer",
                          fontSize: 12, fontWeight: 600, color: req ? "#b45309" : "#94a3b8", flexShrink: 0,
                        }}>
                          <span>{req ? "🔒" : "🔓"}</span>
                          <span>{req ? "Obrigatório" : "Opcional"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <details style={{ marginTop: 16 }}>
                  <summary style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer", userSelect: "none", padding: "0 4px" }}>Ver JSON bruto</summary>
                  <pre style={{ marginTop: 10, background: "#1e293b", color: "#94a3b8", borderRadius: 10, padding: "14px 16px", fontSize: 12, overflowX: "auto", lineHeight: 1.7 }}>
                    {JSON.stringify({ items: result!.items.map((it: ChecklistItem, i: number) => ({ ...it, suggestedRequired: getRequired(i, it) })) }, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        textarea::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}

import { useState } from "react";

type ContentBlock = { type: string; text: string };
type EventResult = {
  suggested_title: string;
  event_type: string;
  location_type: string;
  is_travel_required: boolean;
};

const SYSTEM_PROMPT = `Contexto: Você é o motor de inteligência do "Humand Eventos", um aplicativo corporativo. Sua função é ler a descrição crua de um evento fornecida por um usuário (geralmente do RH ou gestor) e classificar esse evento.
Regras Estritas:
1. Você deve retornar ÚNICA e EXCLUSIVAMENTE um objeto JSON válido.
2. Não inclua saudações, não inclua a formatação \`\`\`json, não explique sua resposta. Apenas o JSON puro.
3. REGRA DE SEGURANÇA CRÍTICA: Se a descrição for lixo, números aleatórios, caracteres sem sentido, texto incoerente ou qualquer coisa que não descreva claramente um evento corporativo real, você DEVE retornar exatamente: { "suggested_title": "Descrição Inválida", "event_type": "Outro", "location_type": "Presencial", "is_travel_required": false }. Não tente inventar ou inferir um evento a partir de descrições inválidas.
Estrutura do JSON Esperada (Contrato): { "suggested_title": "Título curto e profissional para o evento", "event_type": "Classifique em uma destas opções: [Offsite, Hackathon, Treinamento, Confraternização, Viagem Corporativa, Palestra, Outro]", "location_type": "Classifique em: [Presencial, Remoto, Híbrido]", "is_travel_required": true ou false }`;

const TYPE_STYLES = {
  Offsite:             { bg: "#f3e8ff", color: "#7e22ce" },
  Hackathon:           { bg: "#fff7ed", color: "#c2410c" },
  Treinamento:         { bg: "#eff6ff", color: "#1d4ed8" },
  Confraternização:    { bg: "#fdf2f8", color: "#9d174d" },
  "Viagem Corporativa":{ bg: "#fefce8", color: "#854d0e" },
  Palestra:            { bg: "#f0fdfa", color: "#0f766e" },
  Outro:               { bg: "#f1f5f9", color: "#475569" },
};

const LOC_ICONS = { Presencial: "📍", Remoto: "💻", Híbrido: "🔀" };

const INVALID_TITLE = "Descrição Inválida";

export default function App() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<EventResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const classify = async () => {
    if (!description.trim()) return;
    setLoading(true); setResult(null); setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: description }],
        }),
      });
      const data = await res.json();
      const text = data.content?.filter((b: ContentBlock) => b.type === "text").map((b: ContentBlock) => b.text).join("") || "";
      setResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch {
      setError("Erro ao classificar o evento. Verifique a descrição e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setDescription(""); setResult(null); setError(""); };
  const isInvalid = result?.suggested_title === INVALID_TITLE;
  const typeStyle = result ? (TYPE_STYLES[result.event_type as keyof typeof TYPE_STYLES] || TYPE_STYLES.Outro) : TYPE_STYLES.Outro;
  const locIcon = result ? (LOC_ICONS[result.location_type as keyof typeof LOC_ICONS] || "📌") : "📌";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f8fafc", padding: "32px 16px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#1e293b", borderRadius: 12, padding: "10px 20px", marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>🗓️</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>Humand Eventos</span>
          </div>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Classificador inteligente de eventos corporativos</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24, marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#374151", marginBottom: 8 }}>Descrição do evento</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={loading}
            placeholder="Ex: Vamos reunir toda a equipe de produto em São Paulo por dois dias para um workshop de planejamento estratégico 2026..."
            style={{ width: "100%", minHeight: 130, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", background: loading ? "#f8fafc" : "#fff" }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={classify} disabled={loading || !description.trim()} style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: loading || !description.trim() ? "#c7d2fe" : "#6366f1",
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading || !description.trim() ? "not-allowed" : "pointer",
            }}>{loading ? "Classificando..." : "✨ Classificar Evento"}</button>
            {(result || description) && (
              <button onClick={reset} style={{ padding: "11px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Limpar</button>
            )}
          </div>
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", color: "#b91c1c", fontSize: 14 }}>⚠️ {error}</div>}

        {loading && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24 }}>
            {[80, 50, 60, 40].map((w, i) => (
              <div key={i} style={{ height: 16, borderRadius: 8, background: "#f1f5f9", width: `${w}%`, marginBottom: i < 3 ? 14 : 0 }} />
            ))}
          </div>
        )}

        {result && !loading && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24, animation: "fadeIn .4s ease" }}>
            {isInvalid ? (
              /* ── Invalid / empty state ── */
              <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🤔</div>
                <p style={{ fontWeight: 700, fontSize: 16, color: "#1e293b", margin: "0 0 8px" }}>Descrição não reconhecida</p>
                <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 20px", lineHeight: 1.6 }}>
                  Não conseguimos identificar um evento válido nesta descrição.<br />
                  Tente detalhar melhor o seu evento corporativo.
                </p>
                <button onClick={reset} style={{ padding: "9px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Tentar novamente
                </button>
              </div>
            ) : (
              /* ── Valid result ── */
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Evento Classificado</span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px" }}>Título Sugerido</span>
                  <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>{result!.suggested_title}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 8 }}>Tipo</span>
                    <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: typeStyle.bg, color: typeStyle.color }}>
                      {result!.event_type}
                    </span>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 8 }}>Formato</span>
                    <span style={{ fontSize: 20 }}>{locIcon}</span>
                    <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: "#334155" }}>{result!.location_type}</p>
                  </div>
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 8 }}>Viagem</span>
                    <span style={{ fontSize: 20 }}>{result!.is_travel_required ? "✈️" : "🏠"}</span>
                    <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 600, color: result!.is_travel_required ? "#0369a1" : "#334155" }}>
                      {result!.is_travel_required ? "Necessária" : "Não necessária"}
                    </p>
                  </div>
                </div>
                <details style={{ marginTop: 18 }}>
                  <summary style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer", userSelect: "none" }}>Ver JSON bruto</summary>
                  <pre style={{ marginTop: 10, background: "#1e293b", color: "#94a3b8", borderRadius: 10, padding: "14px 16px", fontSize: 12, overflowX: "auto", lineHeight: 1.7 }}>
                    {JSON.stringify(result, null, 2)}
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

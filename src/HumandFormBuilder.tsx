import { useState } from "react";
import { suggestPreferenceFields, type PreferenceField } from "./lib/claudeApi";

const EVENT_TYPES = ["Offsite", "Hackathon", "Treinamento", "Confraternização", "Viagem Corporativa", "Palestra", "Outro"];

const INPUT_CONFIG = {
  text:    { label: "Texto livre", icon: "💬", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  select:  { label: "Seleção",     icon: "📋", bg: "#fdf4ff", color: "#7e22ce", border: "#e9d5ff" },
  boolean: { label: "Sim / Não",   icon: "🔘", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  number:  { label: "Número",      icon: "🔢", bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
};

const lbStyle = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block" };
const inputBase = { marginTop: 6, padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#f8fafc" };

const PREVIEW = {
  text:    ({ label }) => <div><label style={lbStyle}>{label}</label><div style={{ ...inputBase, color: "#94a3b8" }}>Digite sua resposta...</div></div>,
  number:  ({ label }) => <div><label style={lbStyle}>{label}</label><div style={{ ...inputBase, width: 100, color: "#94a3b8" }}>0</div></div>,
  boolean: ({ label }) => (
    <div><label style={lbStyle}>{label}</label>
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        {["Sim", "Não"].map(o => <div key={o} style={{ padding: "6px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#64748b", background: o === "Sim" ? "#f0fdf4" : "#fff", fontWeight: o === "Sim" ? 600 : 400 }}>{o}</div>)}
      </div>
    </div>
  ),
  select:  ({ label, options }) => (
    <div><label style={lbStyle}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {(options || []).map((o, i) => <div key={i} style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${i === 0 ? "#c7d2fe" : "#e2e8f0"}`, fontSize: 12, color: "#64748b", background: i === 0 ? "#eef2ff" : "#fff", fontWeight: i === 0 ? 600 : 400 }}>{o}</div>)}
      </div>
    </div>
  ),
};

export default function App() {
  const [eventType, setEventType] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<{ fields: PreferenceField[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [removed, setRemoved] = useState<number[]>([]);

  const generate = async () => {
    if (!description.trim()) return;
    setLoading(true); setResult(null); setError(""); setRemoved([]); setPreview(false);
    try {
      setResult(await suggestPreferenceFields(description, eventType || undefined));
    } catch {
      setError("Erro ao gerar o formulário. Verifique a descrição e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setDescription(""); setEventType(""); setResult(null); setError(""); setRemoved([]); setPreview(false); };
  const removeField = (i) => setRemoved(p => [...p, i]);
  const activeFields = result ? result.fields.filter((_, i) => !removed.includes(i)) : [];
  const counts = result?.fields?.length > 0
    ? Object.fromEntries(Object.keys(INPUT_CONFIG).map(k => [k, activeFields.filter(f => f.inputType === k).length]))
    : {};

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f8fafc", padding: "32px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#1e293b", borderRadius: 12, padding: "10px 20px", marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>🧩</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>Humand Eventos</span>
          </div>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Gerador de formulário de preferências</p>
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
              placeholder="Ex: Offsite de 2 dias para o time de engenharia em Gramado. Haverá trilha, jantar especial e workshop. Os participantes precisarão se deslocar de POA."
              style={{ width: "100%", minHeight: 110, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", background: loading ? "#f8fafc" : "#fff" }}
              onFocus={e => e.target.style.borderColor = "#6366f1"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={generate} disabled={loading || !description.trim()} style={{
              flex: 1, padding: "11px 0", borderRadius: 10, border: "none",
              background: loading || !description.trim() ? "#c7d2fe" : "#6366f1",
              color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading || !description.trim() ? "not-allowed" : "pointer",
            }}>{loading ? "Gerando formulário..." : "✨ Gerar Formulário"}</button>
            {(result || description) && (
              <button onClick={reset} style={{ padding: "11px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Limpar</button>
            )}
          </div>
        </div>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "14px 18px", color: "#b91c1c", fontSize: 14, marginBottom: 16 }}>⚠️ {error}</div>}

        {loading && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ marginBottom: i < 4 ? 20 : 0 }}>
                <div style={{ height: 12, borderRadius: 6, background: "#f1f5f9", width: "40%", marginBottom: 8 }} />
                <div style={{ height: 36, borderRadius: 8, background: "#f1f5f9", width: "100%" }} />
              </div>
            ))}
          </div>
        )}

        {result && !loading && (
          <div style={{ animation: "fadeIn .4s ease" }}>
            {result.fields.length === 0 ? (
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
              <>
                {/* Summary + toggle */}
                <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: "14px 20px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{activeFields.length} campos</span>
                    {Object.entries(INPUT_CONFIG).map(([k, v]) => counts[k] > 0 && (
                      <span key={k} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: v.bg, color: v.color, border: `1px solid ${v.border}` }}>
                        {v.icon} {counts[k]} {v.label}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => setPreview(p => !p)} style={{
                    padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${preview ? "#6366f1" : "#e2e8f0"}`,
                    background: preview ? "#eef2ff" : "#fff", color: preview ? "#4f46e5" : "#64748b",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>{preview ? "✏️ Editar" : "👁️ Pré-visualizar"}</button>
                </div>

                {preview ? (
                  <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24 }}>
                    <p style={{ margin: "0 0 20px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Pré-visualização do formulário para participantes</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {activeFields.map((f, i) => {
                        const Comp = PREVIEW[f.inputType] || PREVIEW.text;
                        return (
                          <div key={i} style={{ paddingBottom: 20, borderBottom: i < activeFields.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                            <Comp label={f.label} options={f.options} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                    <p style={{ margin: 0, padding: "12px 20px 0", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>Clique no ✕ para remover campos que não se aplicam</p>
                    {result.fields.map((field, i) => {
                      if (removed.includes(i)) return null;
                      const cfg = INPUT_CONFIG[field.inputType] || INPUT_CONFIG.text;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, marginTop: 2 }}>
                            {cfg.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{field.label}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
                              {field.options && <span style={{ fontSize: 12, color: "#94a3b8" }}>· {field.options.join(", ")}</span>}
                            </div>
                          </div>
                          <button onClick={() => removeField(i)} style={{ padding: "4px 8px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontSize: 14, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#fecaca"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <details style={{ marginTop: 16 }}>
                  <summary style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer", userSelect: "none", padding: "0 4px" }}>Ver JSON bruto</summary>
                  <pre style={{ marginTop: 10, background: "#1e293b", color: "#94a3b8", borderRadius: 10, padding: "14px 16px", fontSize: 12, overflowX: "auto", lineHeight: 1.7 }}>
                    {JSON.stringify({ fields: activeFields }, null, 2)}
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

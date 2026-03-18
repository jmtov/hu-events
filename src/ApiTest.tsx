import { useState } from "react";
import {
	detectEventType,
	generateChecklist,
	suggestPreferenceFields,
	estimateBudget,
	type DetectedEvent,
	type Checklist,
	type PreferenceFields,
	type BudgetEstimate,
} from "./lib/claudeApi";

const EVENT_TYPES = [
	"Offsite",
	"Hackathon",
	"Treinamento",
	"Confraternização",
	"Viagem Corporativa",
	"Palestra",
	"Outro",
];

const SAMPLE = "Offsite de 2 dias para o time de engenharia em Gramado. 30 pessoas, transporte de van saindo de Porto Alegre, hospedagem em pousada, trilha e jantar especial.";

type FnName = "detectEventType" | "generateChecklist" | "suggestPreferenceFields" | "estimateBudget";

const FN_CONFIG: Record<FnName, { label: string; icon: string; color: string; border: string; bg: string }> = {
	detectEventType:        { label: "detectEventType",        icon: "🔍", color: "#7e22ce", border: "#e9d5ff", bg: "#fdf4ff" },
	generateChecklist:      { label: "generateChecklist",      icon: "📋", color: "#1d4ed8", border: "#bfdbfe", bg: "#eff6ff" },
	suggestPreferenceFields:{ label: "suggestPreferenceFields", icon: "🧩", color: "#15803d", border: "#bbf7d0", bg: "#f0fdf4" },
	estimateBudget:         { label: "estimateBudget",         icon: "💰", color: "#b45309", border: "#fde68a", bg: "#fffbeb" },
};

type ResultMap = {
	detectEventType?: DetectedEvent;
	generateChecklist?: Checklist;
	suggestPreferenceFields?: PreferenceFields;
	estimateBudget?: BudgetEstimate;
};

export default function ApiTest() {
	const [description, setDescription] = useState(SAMPLE);
	const [eventType, setEventType] = useState("Offsite");
	const [participants, setParticipants] = useState("30");

	const [loading, setLoading] = useState<FnName | null>(null);
	const [errors, setErrors] = useState<Partial<Record<FnName, string>>>({});
	const [results, setResults] = useState<ResultMap>({});

	const run = async (fn: FnName) => {
		if (!description.trim()) return;
		setLoading(fn);
		setErrors((e) => ({ ...e, [fn]: undefined }));
		try {
			let result: unknown;
			if (fn === "detectEventType")
				result = await detectEventType(description);
			else if (fn === "generateChecklist")
				result = await generateChecklist(description, eventType || undefined);
			else if (fn === "suggestPreferenceFields")
				result = await suggestPreferenceFields(description, eventType || undefined);
			else
				result = await estimateBudget(description, eventType || undefined, participants ? Number(participants) : undefined);
			setResults((r) => ({ ...r, [fn]: result }));
		} catch (err) {
			setErrors((e) => ({ ...e, [fn]: String(err) }));
		} finally {
			setLoading(null);
		}
	};

	const runAll = async () => {
		for (const fn of Object.keys(FN_CONFIG) as FnName[]) {
			await run(fn);
		}
	};

	return (
		<div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", background: "#f1f5f9", padding: "32px 16px" }}>
			<div style={{ maxWidth: 800, margin: "0 auto" }}>

				{/* Header */}
				<div style={{ marginBottom: 24, textAlign: "center" }}>
					<div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#0f172a", borderRadius: 12, padding: "10px 22px", marginBottom: 10 }}>
						<span style={{ fontSize: 20 }}>⚡</span>
						<span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>claudeApi — Test Panel</span>
					</div>
					<p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>Test all 4 wrapper functions from one place</p>
				</div>

				{/* Inputs */}
				<div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", padding: 24, marginBottom: 20 }}>
					<div style={{ marginBottom: 14 }}>
						<label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>
							Event description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#1e293b", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }}
							onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
							onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
						/>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
						<div>
							<label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>
								Event type <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
							</label>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
								{EVENT_TYPES.map((t) => (
									<button
										key={t}
										onClick={() => setEventType(eventType === t ? "" : t)}
										style={{
											padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
											border: eventType === t ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
											background: eventType === t ? "#eef2ff" : "#fff",
											color: eventType === t ? "#4f46e5" : "#64748b",
										}}
									>{t}</button>
								))}
							</div>
						</div>
						<div>
							<label style={{ display: "block", fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 6 }}>
								Participants <span style={{ color: "#94a3b8", fontWeight: 400 }}>(for estimateBudget)</span>
							</label>
							<input
								type="number"
								value={participants}
								onChange={(e) => setParticipants(e.target.value)}
								min={1}
								style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, width: 100, outline: "none" }}
								onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
								onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
							/>
						</div>
					</div>

					{/* Run buttons */}
					<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
						{(Object.keys(FN_CONFIG) as FnName[]).map((fn) => {
							const cfg = FN_CONFIG[fn];
							const isLoading = loading === fn;
							return (
								<button
									key={fn}
									onClick={() => run(fn)}
									disabled={!!loading || !description.trim()}
									style={{
										display: "flex", alignItems: "center", gap: 6,
										padding: "8px 14px", borderRadius: 8,
										border: `1.5px solid ${cfg.border}`,
										background: isLoading ? cfg.bg : "#fff",
										color: cfg.color, fontWeight: 600, fontSize: 12,
										cursor: loading || !description.trim() ? "not-allowed" : "pointer",
										opacity: loading && !isLoading ? 0.5 : 1,
									}}
								>
									<span>{isLoading ? "⏳" : cfg.icon}</span>
									{isLoading ? "Running…" : cfg.label}
								</button>
							);
						})}
						<button
							onClick={runAll}
							disabled={!!loading || !description.trim()}
							style={{
								marginLeft: "auto", padding: "8px 18px", borderRadius: 8, border: "none",
								background: loading || !description.trim() ? "#c7d2fe" : "#6366f1",
								color: "#fff", fontWeight: 700, fontSize: 12,
								cursor: loading || !description.trim() ? "not-allowed" : "pointer",
							}}
						>
							{loading ? "Running…" : "▶ Run All"}
						</button>
					</div>
				</div>

				{/* Results */}
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
					{(Object.keys(FN_CONFIG) as FnName[]).map((fn) => {
						const cfg = FN_CONFIG[fn];
						const result = results[fn];
						const error = errors[fn];
						const isLoading = loading === fn;

						return (
							<div key={fn} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden" }}>
								{/* Card header */}
								<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: cfg.bg }}>
									<span style={{ fontSize: 16 }}>{cfg.icon}</span>
									<span style={{ fontWeight: 700, fontSize: 13, color: cfg.color }}>{cfg.label}</span>
									{result && <span style={{ marginLeft: "auto", fontSize: 11, color: "#22c55e", fontWeight: 600 }}>✓ OK</span>}
									{error && <span style={{ marginLeft: "auto", fontSize: 11, color: "#ef4444", fontWeight: 600 }}>✗ Error</span>}
								</div>

								{/* Card body */}
								<div style={{ padding: "14px 16px" }}>
									{isLoading && (
										<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
											{[70, 50, 60].map((w, i) => (
												<div key={i} style={{ height: 11, borderRadius: 6, background: "#f1f5f9", width: `${w}%` }} />
											))}
										</div>
									)}
									{error && !isLoading && (
										<p style={{ margin: 0, fontSize: 12, color: "#ef4444", lineHeight: 1.5 }}>{error}</p>
									)}
									{result && !isLoading && (
										<pre style={{ margin: 0, fontSize: 11, color: "#334155", background: "#f8fafc", borderRadius: 8, padding: "10px 12px", overflowX: "auto", lineHeight: 1.7, maxHeight: 260, overflowY: "auto" }}>
											{JSON.stringify(result, null, 2)}
										</pre>
									)}
									{!result && !error && !isLoading && (
										<p style={{ margin: 0, fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "12px 0" }}>
											Not run yet
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

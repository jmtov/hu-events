import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// ---------------------------------------------------------------------------
// Demo event data — hardcoded for HR Retreat scenario
// ---------------------------------------------------------------------------
const EVENT = {
	title: "HR Retreat 2026",
	type: "HR Retreat",
	date: "14–16 April 2026",
	location: "Cartagena, Colombia",
	description:
		"Retiro anual da equipe de RH para planejamento estratégico, atividades de team building e alinhamentos para o segundo semestre. Vamos reunir colaboradores de toda a América Latina e Europa.",
};

// Hardcoded preference fields for the HR Retreat
const PREFERENCE_FIELDS = [
	{
		id: "dietary",
		label: "Restrições alimentares",
		inputType: "select" as const,
		options: [
			"Nenhuma",
			"Vegetariano",
			"Vegano",
			"Sem glúten",
			"Sem lactose",
			"Outra",
		],
	},
	{
		id: "tshirt",
		label: "Tamanho da camiseta",
		inputType: "select" as const,
		options: ["PP", "P", "M", "G", "GG", "XGG"],
	},
	{
		id: "emergency_contact",
		label: "Contato de emergência (nome e telefone)",
		inputType: "text" as const,
		options: [],
	},
];

type FormValues = {
	full_name: string;
	email: string;
	city: string;
	region: string;
	country: string;
	role: string;
	preferences: Record<string, string>;
};

const EMPTY_FORM: FormValues = {
	full_name: "",
	email: "",
	city: "",
	region: "",
	country: "",
	role: "",
	preferences: {},
};

function isFormValid(values: FormValues): boolean {
	return (
		values.full_name.trim() !== "" &&
		values.email.trim() !== "" &&
		values.city.trim() !== "" &&
		values.region.trim() !== "" &&
		values.country.trim() !== ""
	);
}

// ---------------------------------------------------------------------------
// Success screen
// ---------------------------------------------------------------------------
function SuccessScreen({ name, onBack }: { name: string; onBack: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
				🎉
			</div>
			<div className="space-y-2">
				<h2 className="text-2xl font-bold text-foreground">RSVP Confirmado!</h2>
				<p className="text-muted-foreground">
					Obrigado,{" "}
					<span className="font-semibold text-foreground">{name}</span>! Sua
					presença foi registrada com sucesso.
				</p>
				<p className="text-sm text-muted-foreground">
					Você receberá um e-mail de confirmação em breve com os próximos
					passos.
				</p>
			</div>
			<Button variant="outline" onClick={onBack}>
				Voltar ao início
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function HumandRegistration() {
	const [values, setValues] = useState<FormValues>(EMPTY_FORM);
	const [submitted, setSubmitted] = useState(false);

	const setField = (
		field: keyof Omit<FormValues, "preferences">,
		value: string,
	) => setValues((prev) => ({ ...prev, [field]: value }));

	const setPreference = (id: string, value: string) =>
		setValues((prev) => ({
			...prev,
			preferences: { ...prev.preferences, [id]: value },
		}));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isFormValid(values)) return;
		setSubmitted(true);
	};

	if (submitted) {
		return (
			<div className="min-h-screen bg-background px-4 py-10">
				<div className="mx-auto max-w-xl">
					<EventHeader />
					<Card>
						<CardContent className="pt-6">
							<SuccessScreen
								name={values.full_name}
								onBack={() => { setValues(EMPTY_FORM); setSubmitted(false); }}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background px-4 py-10">
			<div className="mx-auto max-w-xl space-y-6">
				<EventHeader />

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic info */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Suas informações</CardTitle>
							<CardDescription>Campos com * são obrigatórios.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="full_name">Nome completo *</Label>
								<Input
									id="full_name"
									placeholder="Ex: Ana Silva"
									value={values.full_name}
									onChange={(e) => setField("full_name", e.target.value)}
									required
								/>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="email">E-mail *</Label>
								<Input
									id="email"
									type="email"
									placeholder="ana@empresa.com"
									value={values.email}
									onChange={(e) => setField("email", e.target.value)}
									required
								/>
							</div>

							<div className="space-y-1.5">
								<Label htmlFor="role">Cargo / equipe</Label>
								<Input
									id="role"
									placeholder="Ex: Gerente de RH"
									value={values.role}
									onChange={(e) => setField("role", e.target.value)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Location */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Localização</CardTitle>
							<CardDescription>
								Usada para estimar custos de viagem e identificar documentos
								necessários.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="city">Cidade *</Label>
								<Input
									id="city"
									placeholder="Ex: São Paulo"
									value={values.city}
									onChange={(e) => setField("city", e.target.value)}
									required
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor="region">Estado / região *</Label>
									<Input
										id="region"
										placeholder="Ex: SP"
										value={values.region}
										onChange={(e) => setField("region", e.target.value)}
										required
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="country">País *</Label>
									<Input
										id="country"
										placeholder="Ex: Brasil"
										value={values.country}
										onChange={(e) => setField("country", e.target.value)}
										required
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Preference fields */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								Preferências do evento
							</CardTitle>
							<CardDescription>
								Ajude o organizador a preparar tudo para você.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{PREFERENCE_FIELDS.map((field, i) => (
								<div key={field.id}>
									{i > 0 && <Separator className="mb-4" />}
									<div className="space-y-1.5">
										<Label htmlFor={field.id}>{field.label}</Label>
										{field.inputType === "select" ? (
											<Select
												value={values.preferences[field.id] ?? ""}
												onValueChange={(v) => setPreference(field.id, v ?? "")}
											>
												<SelectTrigger id={field.id}>
													<SelectValue placeholder="Selecione..." />
												</SelectTrigger>
												<SelectContent>
													{field.options.map((opt) => (
														<SelectItem key={opt} value={opt}>
															{opt}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : (
											<Input
												id={field.id}
												placeholder="Sua resposta..."
												value={values.preferences[field.id] ?? ""}
												onChange={(e) =>
													setPreference(field.id, e.target.value)
												}
											/>
										)}
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					<Button
						type="submit"
						className="w-full"
						disabled={!isFormValid(values)}
					>
						Confirmar presença
					</Button>
				</form>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Event info header
// ---------------------------------------------------------------------------
function EventHeader() {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2.5">
				<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-xl">
					🗓️
				</div>
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Humand Eventos
					</p>
					<p className="text-sm font-bold text-foreground">
						Inscrição para o evento
					</p>
				</div>
			</div>

			<Card>
				<CardContent className="pt-4 pb-4">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1">
							<h1 className="text-lg font-bold text-foreground">
								{EVENT.title}
							</h1>
							<p className="text-sm text-muted-foreground line-clamp-2">
								{EVENT.description}
							</p>
						</div>
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						<Badge variant="secondary">📅 {EVENT.date}</Badge>
						<Badge variant="secondary">📍 {EVENT.location}</Badge>
						<Badge variant="outline">{EVENT.type}</Badge>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

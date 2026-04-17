"use client";

import { useState } from "react";
import { OnboardingData } from "./page";
import { StepHeader, Input, Select, Textarea, NextButton } from "./components";
import { toSlug, cityToSlug, BRAZIL_STATES } from "shared/utils/slug";

const CUISINES = [
  "Hambúrgueres", "Tacos & Mexicano", "Pizza", "Japonês / Sushi",
  "Árabe / Esfiha", "Churrasco", "Frutos do Mar", "Vegano / Vegetariano",
  "Sorvetes & Açaí", "Bebidas & Drinks", "Pastel", "Comida Mineira", "Outro",
];

const STATE_OPTIONS = Object.entries(BRAZIL_STATES).map(([slug, name]) => ({
  value: slug,
  label: `${name} (${slug.toUpperCase()})`,
}));

interface Props {
  data: Partial<OnboardingData>;
  onNext: (fields: Pick<OnboardingData, "name" | "description" | "cuisine" | "phone" | "slug" | "state" | "city" | "cityDisplay" | "stateDisplay">) => void;
}

export function StepInfo({ data, onNext }: Props) {
  const [name, setName] = useState(data.name ?? "");
  const [description, setDescription] = useState(data.description ?? "");
  const [cuisine, setCuisine] = useState(data.cuisine ?? "");
  const [phone, setPhone] = useState(data.phone ?? "");
  const [stateSlug, setStateSlug] = useState(data.state ?? "");
  const [cityInput, setCityInput] = useState(data.cityDisplay ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slugPreview = name && cityInput && stateSlug
    ? `/menu/${stateSlug}/${cityToSlug(cityInput)}/${toSlug(name)}`
    : "";

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nome é obrigatório";
    if (!description.trim()) e.description = "Descrição é obrigatória";
    if (!cuisine) e.cuisine = "Escolha uma categoria";
    if (!phone.trim()) e.phone = "Telefone é obrigatório";
    if (!stateSlug) e.state = "Selecione o estado";
    if (!cityInput.trim()) e.city = "Cidade é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    onNext({
      name, description, cuisine, phone,
      slug: toSlug(name),
      state: stateSlug,
      city: cityToSlug(cityInput),
      cityDisplay: cityInput,
      stateDisplay: stateSlug.toUpperCase(),
    });
  }

  return (
    <div>
      <StepHeader
        emoji="🍔"
        title="Seu food truck"
        subtitle="Essas informações aparecerão no cardápio, no mapa e na URL do seu truck."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Input label="Nome do truck *" placeholder="Ex: Burger do Zé" value={name} onChange={setName} error={errors.name} />
        <Textarea label="Descrição *" placeholder="Conte um pouco sobre seu truck..." value={description} onChange={setDescription} error={errors.description} rows={3} />
        <Select label="Categoria *" value={cuisine} onChange={setCuisine} options={CUISINES} error={errors.cuisine} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 14 }}>
          <div>
            <label style={ls}>Estado *</label>
            <select style={{ ...is, ...(errors.state ? es : {}) }} value={stateSlug} onChange={(e) => setStateSlug(e.target.value)}>
              <option value="">Selecionar...</option>
              {STATE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {errors.state && <span style={et}>{errors.state}</span>}
          </div>
          <div>
            <label style={ls}>Cidade *</label>
            <input style={{ ...is, ...(errors.city ? es : {}) }} placeholder="Ex: São Paulo" value={cityInput} onChange={(e) => setCityInput(e.target.value)} />
            {errors.city && <span style={et}>{errors.city}</span>}
          </div>
        </div>

        {slugPreview && (
          <div style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)", borderRadius: 12, padding: "12px 16px" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 4 }}>URL do seu cardápio:</span>
            <span style={{ fontSize: 13, color: "#FF6B35", fontFamily: "monospace", wordBreak: "break-all" }}>
              foodpronto.com.br{slugPreview}
            </span>
          </div>
        )}

        <Input label="WhatsApp / Telefone *" placeholder="(11) 99999-9999" value={phone} onChange={setPhone} error={errors.phone} type="tel" />
      </div>
      <NextButton onClick={handleNext} label="Próximo — Localização →" />
    </div>
  );
}

const ls: React.CSSProperties = { display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, marginBottom: 8 };
const is: React.CSSProperties = { width: "100%", padding: "14px 16px", background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#FFF", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none", WebkitAppearance: "none" };
const es: React.CSSProperties = { border: "1px solid rgba(255,68,68,0.5)" };
const et: React.CSSProperties = { color: "#FF4444", fontSize: 12, marginTop: 6, display: "block" };

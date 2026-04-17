"use client";

import { useState } from "react";
import { OnboardingData } from "./page";
import { StepHeader, NextButton, BackButton } from "./components";

const DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
] as const;

type DayKey = typeof DAYS[number]["key"];

type DayHours = { open: string; close: string };
type Hours = Partial<Record<DayKey, DayHours>>;

interface Props {
  data: Partial<OnboardingData>;
  onBack: () => void;
  onNext: (fields: Pick<OnboardingData, "openingHours">) => void;
}

export function StepHours({ data, onBack, onNext }: Props) {
  const [hours, setHours] = useState<Hours>(data.openingHours ?? {});
  const [active, setActive] = useState<Set<DayKey>>(
    new Set(Object.keys(data.openingHours ?? {}) as DayKey[])
  );

  function toggleDay(day: DayKey) {
    const next = new Set(active);
    if (next.has(day)) {
      next.delete(day);
      setHours((h) => {
        const copy = { ...h };
        delete copy[day];
        return copy;
      });
    } else {
      next.add(day);
      setHours((h) => ({ ...h, [day]: { open: "08:00", close: "22:00" } }));
    }
    setActive(next);
  }

  function setTime(day: DayKey, field: "open" | "close", value: string) {
    setHours((h) => ({
      ...h,
      [day]: { ...(h[day] ?? { open: "08:00", close: "22:00" }), [field]: value },
    }));
  }

  // Appliquer les mêmes horaires à tous les jours actifs
  function applyToAll(source: DayKey) {
    const srcHours = hours[source];
    if (!srcHours) return;
    const updated: Hours = {};
    active.forEach((day) => { updated[day] = { ...srcHours }; });
    setHours(updated);
  }

  return (
    <div>
      <StepHeader
        emoji="🕐"
        title="Horários de funcionamento"
        subtitle="Selecione os dias e horários que você costuma operar."
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DAYS.map(({ key, label }) => {
          const isActive = active.has(key);
          const dayHours = hours[key];

          return (
            <div key={key} style={{ ...s.dayRow, ...(isActive ? s.dayRowActive : {}) }}>
              {/* Toggle + label */}
              <button
                style={{ ...s.dayToggle, ...(isActive ? s.dayToggleActive : {}) }}
                onClick={() => toggleDay(key)}
              >
                <div style={{ ...s.toggleDot, ...(isActive ? s.toggleDotActive : {}) }} />
              </button>

              <span style={{ ...s.dayLabel, ...(isActive ? s.dayLabelActive : {}) }}>
                {label}
              </span>

              {/* Horários */}
              {isActive && dayHours ? (
                <div style={s.timeRow}>
                  <input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => setTime(key, "open", e.target.value)}
                    style={s.timeInput}
                  />
                  <span style={s.timeSep}>às</span>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => setTime(key, "close", e.target.value)}
                    style={s.timeInput}
                  />
                  <button style={s.applyBtn} onClick={() => applyToAll(key)} title="Aplicar a todos">
                    ⇅
                  </button>
                </div>
              ) : (
                <span style={s.closedLabel}>Fechado</span>
              )}
            </div>
          );
        })}
      </div>

      {active.size === 0 && (
        <p style={s.hint}>💡 Você pode definir os horários depois no painel.</p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <BackButton onClick={onBack} />
        <NextButton onClick={() => onNext({ openingHours: hours })} label="Próximo — Pagamento →" flex />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  dayRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    background: "#1A1A1A",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "border-color 0.2s",
  },
  dayRowActive: {
    border: "1px solid rgba(255,107,53,0.2)",
    background: "rgba(255,107,53,0.04)",
  },
  dayToggle: {
    width: 36,
    height: 20,
    borderRadius: 100,
    background: "rgba(255,255,255,0.08)",
    border: "none",
    cursor: "pointer",
    padding: 2,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    transition: "background 0.2s",
  },
  dayToggleActive: { background: "#FF6B35", justifyContent: "flex-end" },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#FFF",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },
  toggleDotActive: {},
  dayLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    fontWeight: 500,
    width: 60,
    flexShrink: 0,
    transition: "color 0.2s",
  },
  dayLabelActive: { color: "#FFF" },
  timeRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "flex-end",
  },
  timeInput: {
    padding: "6px 8px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    color: "#FFF",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    width: 90,
  },
  timeSep: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  applyBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,107,53,0.6)",
    fontSize: 16,
    cursor: "pointer",
    padding: "4px 6px",
    borderRadius: 6,
    title: "Aplicar a todos os dias",
  },
  closedLabel: {
    color: "rgba(255,255,255,0.15)",
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  hint: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    margin: "16px 0 0",
    textAlign: "center",
  },
};

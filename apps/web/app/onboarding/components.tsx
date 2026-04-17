"use client";

// ============================================
// COMPOSANTS UI PARTAGÉS — Onboarding
// ============================================

export function StepHeader({
  emoji, title, subtitle,
}: {
  emoji: string; title: string; subtitle: string;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>{emoji}</span>
      <h1 style={sh.title}>{title}</h1>
      <p style={sh.subtitle}>{subtitle}</p>
    </div>
  );
}

export function Input({
  label, placeholder, value, onChange, error, type = "text",
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; type?: string;
}) {
  return (
    <div>
      <label style={sh.label}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...sh.input, ...(error ? sh.inputError : {}) }}
      />
      {error && <p style={sh.error}>{error}</p>}
    </div>
  );
}

export function Textarea({
  label, placeholder, value, onChange, error, rows = 3,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string; rows?: number;
}) {
  return (
    <div>
      <label style={sh.label}>{label}</label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{ ...sh.input, ...sh.textarea, ...(error ? sh.inputError : {}) }}
      />
      {error && <p style={sh.error}>{error}</p>}
    </div>
  );
}

export function Select({
  label, value, onChange, options, error,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; error?: string;
}) {
  return (
    <div>
      <label style={sh.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...sh.input, ...(error ? sh.inputError : {}) }}
      >
        <option value="">Selecionar...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p style={sh.error}>{error}</p>}
    </div>
  );
}

export function NextButton({
  onClick, label, flex, disabled,
}: {
  onClick: () => void; label: string; flex?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sh.nextBtn,
        ...(flex ? { flex: 1 } : { width: "100%", marginTop: 32 }),
        ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
      }}
    >
      {label}
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={sh.backBtn}>
      ← Voltar
    </button>
  );
}

const sh: Record<string, React.CSSProperties> = {
  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: 800,
    margin: "0 0 8px",
    fontFamily: "'Syne', system-ui, sans-serif",
    lineHeight: 1.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    margin: 0,
    lineHeight: 1.5,
  },
  label: {
    display: "block",
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 8,
    letterSpacing: "0.02em",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#FFF",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    appearance: "none",
    WebkitAppearance: "none",
  },
  inputError: {
    border: "1px solid rgba(255,68,68,0.5)",
  },
  textarea: {
    resize: "vertical",
    lineHeight: 1.5,
  },
  error: {
    color: "#FF4444",
    fontSize: 12,
    margin: "6px 0 0",
  },
  nextBtn: {
    padding: "16px 24px",
    background: "#FF6B35",
    color: "#FFF",
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 8px 24px rgba(255,107,53,0.3)",
    transition: "transform 0.1s, box-shadow 0.1s",
    boxSizing: "border-box",
  },
  backBtn: {
    padding: "16px 20px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 14,
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },
};

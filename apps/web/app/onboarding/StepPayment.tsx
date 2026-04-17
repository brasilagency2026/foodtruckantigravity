"use client";

import { StepHeader, BackButton } from "./components";

interface Props {
  onBack: () => void;
  onFinish: (paymentConnected: boolean) => void;
  loading: boolean;
}

export function StepPayment({ onBack, onFinish, loading }: Props) {
  return (
    <div>
      <StepHeader
        emoji="💳"
        title="Receba seus pagamentos"
        subtitle="Conecte sua conta Mercado Pago para aceitar Pix, cartão de crédito e débito."
      />

      {/* Card MP */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.mpLogo}>
            <span style={{ fontSize: 28 }}>🔵</span>
            <div>
              <p style={s.mpName}>Mercado Pago</p>
              <p style={s.mpDesc}>Pix · Crédito · Débito</p>
            </div>
          </div>
        </div>

        <div style={s.methods}>
          {[
            { icon: "⚡", label: "Pix", desc: "Receba na hora, taxa 0%" },
            { icon: "💳", label: "Crédito", desc: "Até 12x, taxa 4,99%" },
            { icon: "🏦", label: "Débito", desc: "Na hora, taxa 3,49%" },
          ].map((m) => (
            <div key={m.label} style={s.method}>
              <span style={s.methodIcon}>{m.icon}</span>
              <div>
                <p style={s.methodLabel}>{m.label}</p>
                <p style={s.methodDesc}>{m.desc}</p>
              </div>
              <span style={s.check}>✓</span>
            </div>
          ))}
        </div>

        <a
          href="https://www.mercadopago.com.br/developers/pt/docs/checkout-api/landing"
          target="_blank"
          rel="noreferrer"
          style={s.connectBtn}
        >
          Conectar Mercado Pago →
        </a>
      </div>

      {/* Pular por agora */}
      <p style={s.skipNote}>
        Você pode conectar depois no painel. Sem pagamento configurado, o truck não aceitará pedidos online.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <BackButton onClick={onBack} />

        <button
          style={{ ...s.finishBtn, ...(loading ? s.finishBtnLoading : {}) }}
          onClick={() => onFinish(false)}
          disabled={loading}
        >
          {loading ? "Criando seu truck..." : "🚀 Criar meu food truck!"}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  cardHeader: { marginBottom: 20 },
  mpLogo: { display: "flex", alignItems: "center", gap: 14 },
  mpName: { color: "#FFF", fontWeight: 700, fontSize: 16, margin: 0 },
  mpDesc: { color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "2px 0 0" },
  methods: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 },
  method: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 16px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 12,
  },
  methodIcon: { fontSize: 22, width: 28, textAlign: "center", flexShrink: 0 },
  methodLabel: { color: "#FFF", fontWeight: 600, fontSize: 14, margin: 0 },
  methodDesc: { color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "2px 0 0" },
  check: { color: "#22C55E", marginLeft: "auto", fontSize: 16, fontWeight: 700 },
  connectBtn: {
    display: "block",
    width: "100%",
    padding: "16px",
    background: "#009EE3",
    color: "#FFF",
    borderRadius: 14,
    textAlign: "center",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 15,
    boxSizing: "border-box",
  },
  skipNote: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 1.5,
    margin: 0,
  },
  finishBtn: {
    flex: 1,
    padding: "16px",
    background: "#FF6B35",
    color: "#FFF",
    border: "none",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 8px 24px rgba(255,107,53,0.35)",
    transition: "opacity 0.2s",
  },
  finishBtnLoading: { opacity: 0.6, cursor: "not-allowed" },
};

"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";

type PaymentMethod = "pix" | "cartao_credito" | "cartao_debito";

const METHODS: { key: PaymentMethod; icon: string; label: string; desc: string }[] = [
  { key: "pix", icon: "⚡", label: "Pix", desc: "Aprovação instantânea" },
  { key: "cartao_credito", icon: "💳", label: "Crédito", desc: "Parcelamento" },
  { key: "cartao_debito", icon: "🏦", label: "Débito", desc: "Débito na hora" },
];

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  observations?: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const truckId = searchParams.get("truckId") ?? "";
  const itemsRaw = searchParams.get("items") ?? "[]";
  const items: CartItem[] = JSON.parse(itemsRaw);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const truck = useQuery(api.foodTrucks.getTruckById, truckId ? { truckId: truckId as Id<"foodTrucks"> } : "skip");

  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = useMutation(api.orders.createOrder);
  const createPayment = useAction(api.payments.createPayment);

  async function handlePay() {
    if (!name.trim() || !phone.trim()) {
      setError("Preencha seu nome e telefone.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const orderId = await createOrder({
        truckId: truckId as Id<"foodTrucks">,
        clientId: "guest",
        clientName: name,
        clientPhone: phone,
        items,
        totalPrice: total,
        paymentMethod: method,
      });

      const payment = await createPayment({
        orderId,
        truckId: truckId as Id<"foodTrucks">,
        totalPrice: total,
        paymentMethod: method,
        clientEmail: "cliente@foodpronto.com.br",
        clientName: name,
        description: `Pedido #${orderId.slice(-4).toUpperCase()} — ${truck?.name ?? "Food Truck"}`,
      });

      // For Pix: go to order tracking page (shows QR code)
      // For card: redirect to MP checkout
      if (method === "pix") {
        router.push(`/order/${orderId}`);
      } else if (payment.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
      } else {
        router.push(`/order/${orderId}`);
      }
    } catch (e: any) {
      console.error("Checkout error:", e);
      setError(e?.message ?? "Erro ao processar pagamento. Tente novamente.");
      setLoading(false);
    }
  }

  if (!truckId || items.length === 0) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <p style={{ color: "#fff", fontSize: 18 }}>Carrinho vazio</p>
          <a href="/" style={s.backLink}>← Voltar</a>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <button onClick={() => router.back()} style={s.backBtn}>←</button>
          <h1 style={s.title}>Finalizar pedido</h1>
          <div style={{ width: 40 }} />
        </div>

        {truck && (
          <p style={s.truckName}>📍 {truck.name}</p>
        )}

        {/* Resumo */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Resumo</h2>
          {items.map((item, i) => (
            <div key={i} style={s.summaryRow}>
              <span style={s.summaryQty}>{item.quantity}x</span>
              <span style={s.summaryName}>{item.name}</span>
              <span style={s.summaryPrice}>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={s.totalRow}>
            <span style={s.totalLabel}>Total</span>
            <span style={s.totalValue}>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Dados do cliente */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Seus dados</h2>
          <div style={s.inputWrap}>
            <label style={s.inputLabel}>Nome *</label>
            <input
              style={s.input}
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div style={s.inputWrap}>
            <label style={s.inputLabel}>WhatsApp *</label>
            <input
              style={s.input}
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
            />
          </div>
        </div>

        {/* Método de pagamento */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Forma de pagamento</h2>
          {METHODS.map((m) => (
            <button
              key={m.key}
              style={{
                ...s.methodRow,
                ...(method === m.key ? s.methodRowActive : {}),
              }}
              onClick={() => setMethod(m.key)}
            >
              <span style={s.methodIcon}>{m.icon}</span>
              <div style={s.methodInfo}>
                <span style={{
                  ...s.methodLabel,
                  ...(method === m.key ? s.methodLabelActive : {}),
                }}>{m.label}</span>
                <span style={s.methodDesc}>{m.desc}</span>
              </div>
              <div style={{
                ...s.radio,
                ...(method === m.key ? s.radioActive : {}),
              }}>
                {method === m.key && <div style={s.radioDot} />}
              </div>
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={s.errorBanner}>{error}</div>
        )}

        {/* Botão pagar */}
        <button
          style={{
            ...s.payBtn,
            opacity: loading ? 0.6 : 1,
          }}
          onClick={handlePay}
          disabled={loading}
        >
          {loading
            ? "Processando..."
            : `Pagar ${formatPrice(total)} via ${METHODS.find((m) => m.key === method)?.label}`
          }
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0D0D0D",
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  container: {
    maxWidth: 480,
    margin: "0 auto",
    padding: "24px 20px 48px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    background: "rgba(255,255,255,0.06)",
    border: "none",
    borderRadius: 20,
    color: "#fff",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: 800,
    fontFamily: "'Syne', system-ui",
    margin: 0,
  },
  truckName: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    margin: "0 0 24px",
    textAlign: "center" as const,
  },
  section: {
    background: "#1A1A1A",
    borderRadius: 16,
    padding: "20px 16px",
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 16px",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  summaryQty: {
    color: "#FF6B35",
    fontWeight: 700,
    fontSize: 14,
    minWidth: 30,
  },
  summaryName: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  summaryPrice: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: 600,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: 600,
  },
  totalValue: {
    color: "#FF6B35",
    fontSize: 20,
    fontWeight: 800,
  },
  inputWrap: {
    marginBottom: 12,
  },
  inputLabel: {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 15,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  },
  methodRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    marginBottom: 8,
    cursor: "pointer",
    width: "100%",
    textAlign: "left" as const,
    fontFamily: "inherit",
  },
  methodRowActive: {
    background: "rgba(255,107,53,0.08)",
    borderColor: "#FF6B35",
  },
  methodIcon: {
    fontSize: 22,
  },
  methodInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
  },
  methodLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
  },
  methodLabelActive: {
    color: "#FF6B35",
  },
  methodDesc: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    border: "2px solid rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: "#FF6B35",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    background: "#FF6B35",
  },
  errorBanner: {
    background: "rgba(239,68,68,0.1)",
    color: "#EF4444",
    padding: "12px 16px",
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center" as const,
  },
  payBtn: {
    width: "100%",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #FF6B35, #FF8F5E)",
    border: "none",
    borderRadius: 14,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  empty: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 16,
  },
  backLink: {
    color: "#FF6B35",
    fontSize: 15,
    textDecoration: "none",
  },
};

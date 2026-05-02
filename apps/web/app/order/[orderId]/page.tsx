"use client";

import { useQuery, useMutation } from "convex/react";
import { useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";
import { NativeBridge } from "../../../lib/NativeBridge";
import { useState } from "react";

function playReadySound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    // Cheerful melody: C5-E5-G5-C6
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = now + i * 0.18;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
    setTimeout(() => ctx.close(), 2000);
  } catch {}
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  recebido: { label: "Pedido recebido", color: "#3B82F6", icon: "📋" },
  preparando: { label: "Preparando", color: "#F59E0B", icon: "👨‍🍳" },
  pronto: { label: "Pronto para retirada!", color: "#22C55E", icon: "✅" },
  entregue: { label: "Entregue", color: "#6B7280", icon: "🎉" },
  cancelado: { label: "Cancelado", color: "#EF4444", icon: "❌" },
};

const PAYMENT_MAP: Record<string, { label: string; color: string }> = {
  pendente: { label: "Aguardando pagamento", color: "#F59E0B" },
  aprovado: { label: "Pago", color: "#22C55E" },
  recusado: { label: "Recusado", color: "#EF4444" },
  reembolsado: { label: "Reembolsado", color: "#6B7280" },
};

export default function OrderPage({
  params,
}: {
  params: { orderId: string };
}) {
  const orderId = params.orderId as Id<"orders">;
  const order = useQuery(api.orders.getOrderById, { orderId });
  const searchParams = useSearchParams();
  const linkPayment = useMutation(api.orders.linkPaymentId);
  const handlePayment = useMutation(api.payments.handleWebhook);

  // Fallback: Se o Mercado Pago redirecionar de volta com status=approved, confirmar o pagamento
  useEffect(() => {
    if (!order || order.paymentStatus === "aprovado") return;
    
    const paymentId = searchParams.get("payment_id") || searchParams.get("collection_id");
    const mpStatus = searchParams.get("status") || searchParams.get("collection_status");
    const paymentType = searchParams.get("payment_type");
    
    if (paymentId && mpStatus === "approved") {
      // Tentar linkar e confirmar imediatamente pelo cliente (optimistic)
      let pmType: any = undefined;
      if (paymentType === "credit_card") pmType = "cartao_credito";
      else if (paymentType === "debit_card") pmType = "cartao_debito";
      else if (paymentType === "pix" || paymentType === "account_money") pmType = "pix";

      linkPayment({ orderId, mercadoPagoPaymentId: paymentId })
        .then(() => handlePayment({ 
          mercadoPagoPaymentId: paymentId, 
          status: mpStatus,
          paymentMethod: pmType 
        }))
        .catch(console.error);
    }
  }, [order, searchParams, linkPayment, handlePayment]);

  const prevStatus = useRef<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (!order) return;
    if (prevStatus.current !== null && prevStatus.current !== "pronto" && order.status === "pronto") {
      playReadySound();
      NativeBridge.vibrateNotification();
      NativeBridge.scheduleNotification("Seu pedido está pronto! ✅", "Retire-o agora no balcão.", "client_ready");
    }
    prevStatus.current = order.status;
  }, [order?.status]);

  if (order === undefined) {
    return (
      <div style={s.page}>
        <div style={s.loading}>
          <div style={s.spinner} />
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div style={s.page}>
        <div style={s.empty}>
          <p style={{ color: "#fff", fontSize: 18 }}>Pedido não encontrado</p>
          <a href="/" style={s.backLink}>← Voltar</a>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] ?? STATUS_MAP.recebido;
  const payment = PAYMENT_MAP[order.paymentStatus] ?? PAYMENT_MAP.pendente;

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <h1 style={s.title}>Acompanhar pedido</h1>
          <p style={s.orderCode}>#{orderId.slice(-4).toUpperCase()}</p>
          {hasPermission !== true && (
            <button 
              onClick={async () => {
                const granted = await NativeBridge.requestPermissions();
                setHasPermission(granted);
                if (granted) NativeBridge.vibrate('light');
              }}
              style={{ marginTop: 12, background: 'rgba(255,107,53,0.1)', color: '#FF6B35', border: '1px solid #FF6B35', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: 13 }}
            >
              🔔 Ativar avisos de retirada
            </button>
          )}
        </div>

        {/* Status principal */}
        <div style={{ ...s.statusCard, borderColor: status.color }}>
          <span style={{ fontSize: 40 }}>{status.icon}</span>
          <p style={{ ...s.statusLabel, color: status.color }}>{status.label}</p>
          {order.estimatedTime && (
            <p style={s.eta}>⏱ Estimativa: {order.estimatedTime} min</p>
          )}
        </div>

        {/* Cancellation alert */}
        {order.status === "cancelado" && (
          <div style={s.cancelNotice}>
            <span style={{ fontSize: 28 }}>⚠️</span>
            <div>
              <p style={s.cancelNoticeTitle}>Pedido cancelado</p>
              <p style={s.cancelNoticeText}>
                Seu pedido foi cancelado pela cozinha. Dirija-se ao balcão do food truck para reembolso ou troca.
              </p>
            </div>
          </div>
        )}

        {/* Cash payment notice */}
        {order.paymentMethod === "dinheiro" && order.paymentStatus === "pendente" && (
          <div style={s.cashNotice}>
            <span style={{ fontSize: 28 }}>💵</span>
            <div>
              <p style={s.cashNoticeTitle}>Pagamento em dinheiro</p>
              <p style={s.cashNoticeText}>
                Dirija-se ao balcão do food truck e efetue o pagamento em dinheiro. 
                Seu pedido será preparado após a confirmação.
              </p>
            </div>
          </div>
        )}

        {/* Pagamento */}
        <div style={s.paymentRow}>
          <span style={s.paymentLabel}>Pagamento</span>
          <span style={{ ...s.paymentStatus, color: payment.color }}>
            {payment.label}
          </span>
        </div>

        {/* Itens */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Itens do pedido</h2>
          {order.items.map((item: any, i: number) => (
            <div key={i} style={s.itemRow}>
              <span style={s.itemQty}>{item.quantity}x</span>
              <span style={s.itemName}>{item.name}</span>
              <span style={s.itemPrice}>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div style={s.totalRow}>
            <span style={s.totalLabel}>Total</span>
            <span style={s.totalValue}>{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Dados */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Dados do pedido</h2>
          <div style={s.dataRow}>
            <span style={s.dataLabel}>Cliente</span>
            <span style={s.dataValue}>{order.clientName}</span>
          </div>
          <div style={s.dataRow}>
            <span style={s.dataLabel}>Telefone</span>
            <span style={s.dataValue}>{order.clientPhone}</span>
          </div>
          <div style={s.dataRow}>
            <span style={s.dataLabel}>Pagamento</span>
            <span style={s.dataValue}>
              {order.paymentMethod === "pix" ? "Pix" : order.paymentMethod === "cartao_credito" ? "Crédito" : order.paymentMethod === "dinheiro" ? "Dinheiro" : "Débito"}
            </span>
          </div>
        </div>

        <p style={s.realtimeNote}>
          🔄 Esta página atualiza em tempo real
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
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
    padding: "32px 20px 48px",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid rgba(255,107,53,0.2)",
    borderTop: "3px solid #FF6B35",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
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
  header: {
    textAlign: "center" as const,
    marginBottom: 28,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: 800,
    fontFamily: "'Syne', system-ui",
    margin: 0,
  },
  orderCode: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    margin: "6px 0 0",
    fontFamily: "monospace",
  },
  statusCard: {
    background: "#1A1A1A",
    borderRadius: 20,
    padding: "32px 24px",
    textAlign: "center" as const,
    marginBottom: 16,
    border: "2px solid",
  },
  statusLabel: {
    fontSize: 22,
    fontWeight: 800,
    margin: "12px 0 0",
    fontFamily: "'Syne', system-ui",
  },
  eta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    margin: "8px 0 0",
  },
  cashNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: "rgba(245,158,11,0.08)",
    border: "2px solid rgba(245,158,11,0.3)",
    borderRadius: 16,
    padding: "18px 16px",
    marginBottom: 16,
  },
  cashNoticeTitle: {
    color: "#F59E0B",
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 6px",
  },
  cashNoticeText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    lineHeight: 1.5,
    margin: 0,
  },
  cancelNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    background: "rgba(239,68,68,0.08)",
    border: "2px solid rgba(239,68,68,0.3)",
    borderRadius: 16,
    padding: "18px 16px",
    marginBottom: 16,
  },
  cancelNoticeTitle: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: 700,
    margin: "0 0 6px",
  },
  cancelNoticeText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    lineHeight: 1.5,
    margin: 0,
  },
  paymentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#1A1A1A",
    borderRadius: 12,
    padding: "14px 18px",
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  paymentLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: 700,
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
  itemRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  itemQty: {
    color: "#FF6B35",
    fontWeight: 700,
    fontSize: 14,
    minWidth: 30,
  },
  itemName: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  itemPrice: {
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
  dataRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dataLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  dataValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
  },
  realtimeNote: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    textAlign: "center" as const,
    marginTop: 20,
  },
};

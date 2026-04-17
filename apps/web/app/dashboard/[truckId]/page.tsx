"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";
import { getQRCodeImageUrl, downloadQRCode } from "shared/utils/qrCode";

export default function DashboardPage({
  params,
}: {
  params: { truckId: string };
}) {
  const truckId = params.truckId as Id<"foodTrucks">;
  const truck = useQuery(api.foodTrucks.getTruckById, { truckId });
  const stats = useQuery(api.payments.getDailyStats, { truckId });
  const toggleOpen = useMutation(api.foodTrucks.toggleOpen);

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const qrUrl = getQRCodeImageUrl(params.truckId, BASE_URL, 300);

  if (!truck) {
    return (
      <div style={s.loading}>
        <div style={s.spinner} />
      </div>
    );
  }

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.truckName}>{truck.name}</h1>
          <p style={s.cuisine}>{truck.cuisine}</p>
        </div>

        {/* Toggle aberto/fechado */}
        <button
          style={{ ...s.toggleBtn, ...(truck.isOpen ? s.toggleOpen : s.toggleClosed) }}
          onClick={() => toggleOpen({ truckId, isOpen: !truck.isOpen })}
        >
          {truck.isOpen ? "🟢 Aberto" : "🔴 Fechado"}
        </button>
      </div>

      {/* Stats do dia */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <p style={s.statValue}>
            {formatPrice(stats?.totalRevenue ?? 0)}
          </p>
          <p style={s.statLabel}>Faturamento hoje</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statValue}>{stats?.totalOrders ?? 0}</p>
          <p style={s.statLabel}>Pedidos hoje</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statValue}>{truck.rating.toFixed(1)} ⭐</p>
          <p style={s.statLabel}>{truck.totalReviews} avaliações</p>
        </div>
      </div>

      {/* QR Code */}
      <div style={s.qrCard}>
        <div style={s.qrLeft}>
          <h2 style={s.qrTitle}>QR Code do cardápio</h2>
          <p style={s.qrDesc}>
            Imprima e cole no balcão. Os clientes escaneiam e fazem o pedido direto pelo celular.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={s.qrBtn}
              onClick={() => downloadQRCode(params.truckId, truck.name, BASE_URL)}
            >
              ⬇️ Baixar PNG
            </button>
            <button
              style={s.qrBtnSecondary}
              onClick={() => navigator.clipboard.writeText(`${BASE_URL}/menu/${params.truckId}`)}
            >
              🔗 Copiar link
            </button>
          </div>
        </div>
        <img src={qrUrl} alt="QR Code" style={s.qrImg} />
      </div>

      {/* Links rápidos */}
      <div style={s.quickLinks}>
        {[
          { href: `/dashboard/${params.truckId}/menu`, icon: "📋", label: "Gerenciar cardápio" },
          { href: `/cozinha`, icon: "👨‍🍳", label: "Painel da cozinha" },
          { href: `/dashboard/${params.truckId}/settings`, icon: "⚙️", label: "Configurações" },
        ].map((link) => (
          <a key={link.href} href={link.href} style={s.quickLink}>
            <span style={s.quickLinkIcon}>{link.icon}</span>
            <span style={s.quickLinkLabel}>{link.label}</span>
            <span style={s.quickLinkArrow}>→</span>
          </a>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: "100vh", background: "#0D0D0D",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  spinner: {
    width: 32, height: 32,
    border: "3px solid rgba(255,107,53,0.2)",
    borderTop: "3px solid #FF6B35",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  page: {
    minHeight: "100vh",
    background: "#0D0D0D",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: "32px 24px 48px",
    maxWidth: 640,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  truckName: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    fontFamily: "'Syne', system-ui",
  },
  cuisine: { color: "#FF6B35", fontSize: 13, margin: "4px 0 0", fontWeight: 500 },
  toggleBtn: {
    padding: "10px 18px",
    borderRadius: 100,
    border: "none",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
  },
  toggleOpen: { background: "rgba(34,197,94,0.15)", color: "#22C55E" },
  toggleClosed: { background: "rgba(239,68,68,0.1)", color: "#EF4444" },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    background: "#1A1A1A",
    borderRadius: 16,
    padding: "16px 12px",
    border: "1px solid rgba(255,255,255,0.06)",
    textAlign: "center",
  },
  statValue: { color: "#FFF", fontSize: 18, fontWeight: 800, margin: 0 },
  statLabel: { color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "4px 0 0" },
  qrCard: {
    background: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    border: "1px solid rgba(255,107,53,0.15)",
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  qrLeft: { flex: 1, minWidth: 180 },
  qrTitle: { color: "#FFF", fontSize: 18, fontWeight: 700, margin: "0 0 8px" },
  qrDesc: { color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" },
  qrBtn: {
    padding: "10px 16px",
    background: "#FF6B35",
    color: "#FFF",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  qrBtnSecondary: {
    padding: "10px 16px",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  qrImg: {
    width: 120,
    height: 120,
    borderRadius: 12,
    flexShrink: 0,
  },
  quickLinks: { display: "flex", flexDirection: "column", gap: 8 },
  quickLink: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 20px",
    background: "#1A1A1A",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
    textDecoration: "none",
    transition: "border-color 0.2s",
  },
  quickLinkIcon: { fontSize: 20, width: 28, textAlign: "center" },
  quickLinkLabel: { color: "#FFF", fontSize: 15, fontWeight: 500, flex: 1 },
  quickLinkArrow: { color: "rgba(255,255,255,0.2)", fontSize: 16 },
};

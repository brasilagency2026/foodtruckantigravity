"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
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
  const updateLocation = useMutation(api.foodTrucks.updateLocation);

  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const mpStatus = searchParams.get("mp"); // "success" or "error"

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const qrUrl = getQRCodeImageUrl(params.truckId, BASE_URL, 300);
  const [showManualModal, setShowManualModal] = useState(false);
  const allMenuItems = useQuery(api.menu.getAllMenuItemsByTruck, { truckId });
  const createOrder = useMutation(api.orders.createOrder);
  const confirmCash = useMutation(api.orders.confirmCashPayment);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&language=pt-BR`
      );
      const data = await res.json();
      return data.results?.[0]?.formatted_address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleToggle = useCallback(async () => {
    if (!truck) return;
    const newOpen = !truck.isOpen;

    if (newOpen) {
      // Opening: get current location first
      setLocating(true);
      setLocationStatus("📍 Obtendo localização...");

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });

        const { latitude, longitude } = pos.coords;
        const address = await reverseGeocode(latitude, longitude);

        await updateLocation({ truckId, latitude, longitude, address });
        await toggleOpen({ truckId, isOpen: true });
        setLocationStatus("✅ Localização atualizada!");
        setTimeout(() => setLocationStatus(null), 3000);
      } catch (err) {
        console.error("Geolocation error:", err);
        setLocationStatus("⚠️ Localização indisponível. Truck aberto com endereço anterior.");
        await toggleOpen({ truckId, isOpen: true });
        setTimeout(() => setLocationStatus(null), 5000);
      } finally {
        setLocating(false);
      }
    } else {
      // Closing: just toggle off
      await toggleOpen({ truckId, isOpen: false });
    }
  }, [truck, truckId, toggleOpen, updateLocation]);

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
          style={{ ...s.toggleBtn, ...(truck.isOpen ? s.toggleOpen : s.toggleClosed), opacity: locating ? 0.6 : 1 }}
          onClick={handleToggle}
          disabled={locating}
        >
          {locating ? "📍 Localizando..." : truck.isOpen ? "🟢 Aberto" : "🔴 Fechado"}
        </button>
      </div>

      {/* Location status */}
      {locationStatus && (
        <div style={s.locationBanner}>{locationStatus}</div>
      )}

      {/* Current location */}
      <div style={s.locationCard}>
        <span style={{ fontSize: 16 }}>📍</span>
        <div style={{ flex: 1 }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: 0 }}>Localização atual</p>
          <p style={{ color: "#fff", fontSize: 13, margin: "2px 0 0", fontWeight: 500 }}>{truck.address}</p>
        </div>
      </div>

      {/* MP OAuth result banner */}
      {mpStatus === "success" && (
        <div style={{ ...s.locationBanner, background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>
          ✅ Mercado Pago conectado com sucesso!
        </div>
      )}
      {mpStatus === "error" && (
        <div style={{ ...s.locationBanner, background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
          ❌ Erro ao conectar Mercado Pago. {searchParams.get("reason")} {searchParams.get("status")} {searchParams.get("detail") && decodeURIComponent(searchParams.get("detail")!)}
        </div>
      )}

      {/* MP connection status */}
      {!truck.mpAccessToken && (
        <a
          href={`/api/mercadopago/authorize?truckId=${params.truckId}`}
          style={s.mpBanner}
        >
          <span style={{ fontSize: 18 }}>💳</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#FFF", fontSize: 14, fontWeight: 600, margin: 0 }}>Conecte seu Mercado Pago</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "2px 0 0" }}>Para aceitar pagamentos online (Pix, crédito, débito)</p>
          </div>
          <span style={{ color: "#009EE3", fontWeight: 700, fontSize: 13 }}>Conectar →</span>
        </a>
      )}

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
              onClick={() => navigator.clipboard.writeText(`${BASE_URL}/t/${params.truckId}`)}
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
          { href: `#`, icon: "📝", label: "Criar pedido manual", onClick: () => setShowManualModal(true) },
        ].map((link) => (
          <a key={link.label} href={link.href} onClick={(e) => { if (link.onClick) { e.preventDefault(); link.onClick(); } }} style={s.quickLink}>
            <span style={s.quickLinkIcon}>{link.icon}</span>
            <span style={s.quickLinkLabel}>{link.label}</span>
            <span style={s.quickLinkArrow}>→</span>
          </a>
        ))}
      </div>

      {/* Manual Order Modal */}
      {showManualModal && (
        <ManualOrderModal
          truckId={truckId}
          items={allMenuItems}
          onClose={() => setShowManualModal(false)}
          onCreate={async (payload: any) => {
            try {
              const orderId = await createOrder(payload);
              if (payload.paymentMethod === "dinheiro" && payload.paymentReceived) {
                await confirmCash({ orderId });
              }
            } catch (err) {
              console.error("Erro criando pedido manual:", err);
            }
            setShowManualModal(false);
          }}
        />
      )}

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
  locationBanner: {
    background: "rgba(255,107,53,0.1)",
    color: "#FF6B35",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  locationCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    background: "#1A1A1A",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  mpBanner: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "16px 20px",
    background: "rgba(0,158,227,0.08)",
    borderRadius: 14,
    border: "1px solid rgba(0,158,227,0.2)",
    marginBottom: 24,
    textDecoration: "none",
    cursor: "pointer",
  },
};

// Manual order modal component
function ManualOrderModal({ truckId, items, onClose, onCreate }: { truckId: string; items: any[] | undefined; onClose: () => void; onCreate: (payload: any) => void }) {
  const [cart, setCart] = useState<{ menuItemId: string; name: string; price: number; quantity: number; sku?: string; variationName?: string }[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro"|"pix"|"cartao_credito"|"cartao_debito">("dinheiro");
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function addToCart(item: any, variationName?: string, variationPrice?: number) {
    const key = variationName ? `${item._id}__${variationName}` : item._id;
    const price = variationPrice ?? item.price;
    const name = variationName ? `${item.name} (${variationName})` : item.name;
    setCart((prev) => {
      const ex = prev.find((p) => p.menuItemId === key);
      if (ex) return prev.map((p) => p.menuItemId === key ? { ...p, quantity: p.quantity + 1 } : p);
      return [...prev, { menuItemId: key, name, price, quantity: 1, sku: item.sku, variationName }];
    });
  }

  function removeFromCart(menuItemId: string) {
    setCart((prev) => prev.map((p) => p.menuItemId === menuItemId ? { ...p, quantity: p.quantity - 1 } : p).filter((p) => p.quantity > 0));
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  async function handleCreate() {
    if (cart.length === 0) {
      alert("Adicione ao menos um item");
      return;
    }
    if (!clientName || clientName.trim() === "") {
      alert("Informe o nome do cliente");
      return;
    }

    const payload = {
      truckId,
      clientId: "",
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      items: cart.map((c) => ({ menuItemId: c.menuItemId, name: c.name, price: c.price, quantity: c.quantity, sku: c.sku, variationName: c.variationName })),
      totalPrice: total,
      paymentMethod,
      paymentReceived,
    };

    try {
      setSubmitting(true);
      await onCreate(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999 }} onClick={onClose}>
      <div style={{ width: 720, maxWidth: "96%", margin: "40px auto", background: "#fff", borderRadius: 12, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: "1px solid #eee" }}>
          <h3 style={{ margin: 0 }}>Criar pedido manual</h3>
          <button onClick={onClose} style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 12, padding: 16 }}>
          <div style={{ flex: 1, maxHeight: "60vh", overflowY: "auto" }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, color: "#333", marginBottom: 6 }}>Nome do cliente</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, color: "#333", marginBottom: 6 }}>Telefone (opcional)</label>
              <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
            </div>

            <div>
              <h4 style={{ margin: "8px 0" }}>Itens</h4>
              {!items ? (
                <div>Carregando itens...</div>
              ) : (
                items.map((it: any) => (
                  <div key={it._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f2f2f2" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{it.name}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>{formatPrice(it.price)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => removeFromCart(it._id)} style={{ padding: "6px 10px" }}>−</button>
                      <span style={{ minWidth: 28, textAlign: "center" }}>{cart.find((c) => c.menuItemId === it._id)?.quantity ?? 0}</span>
                      <button onClick={() => addToCart(it)} style={{ padding: "6px 10px" }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ width: 320, borderLeft: "1px solid #f2f2f2", paddingLeft: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "#666" }}>Método de pagamento</div>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} style={{ width: "100%", padding: 10, borderRadius: 8, marginTop: 6 }}>
                <option value="dinheiro">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de crédito</option>
                <option value="cartao_debito">Cartão de débito</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={paymentReceived} onChange={(e) => setPaymentReceived(e.target.checked)} />
                <span>Recebi o pagamento</span>
              </label>
            </div>

            <div style={{ marginTop: 20, fontWeight: 700, fontSize: 16 }}>
              Total: {formatPrice(total)}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button onClick={handleCreate} disabled={submitting} style={{ flex: 1, padding: "12px 14px", background: "#FF6B35", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>{submitting ? "Enviando..." : "Criar pedido"}</button>
              <button onClick={onClose} style={{ padding: "12px 14px", background: "#eee", border: "none", borderRadius: 10 }}>Fechar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

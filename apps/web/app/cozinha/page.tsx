"use client";

import { useQuery, useMutation } from "convex/react";
import { useRef, useEffect, useCallback } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatPrice, formatOrderStatus } from "shared/types";

function playNewOrderSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    // Three ascending beeps
    [0, 0.15, 0.3].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 600 + i * 200;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
      osc.start(now + delay);
      osc.stop(now + delay + 0.12);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {}
}

export default function CozinhaPage() {
  const myTrucks = useQuery(api.foodTrucks.getMyTrucks);
  const truckId = myTrucks?.[0]?._id as Id<"foodTrucks"> | undefined;

  const orders = useQuery(
    api.orders.getActiveOrdersForTruck,
    truckId ? { truckId } : "skip"
  );

  const prevOrderCount = useRef<number | null>(null);

  useEffect(() => {
    if (!orders) return;
    if (prevOrderCount.current !== null && orders.length > prevOrderCount.current) {
      playNewOrderSound();
    }
    prevOrderCount.current = orders.length;
  }, [orders]);

  const updateStatus = useMutation(api.orders.updateOrderStatus);
  const confirmCash = useMutation(api.orders.confirmCashPayment);

  if (!myTrucks) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Carregando...</p>
      </div>
    );
  }

  if (!truckId) {
    return (
      <div className="loading">
        <p>Nenhum truck encontrado para sua conta.</p>
        <a href="/onboarding" style={{ color: "#FF6B35", textDecoration: "underline", marginTop: 12 }}>Cadastrar meu truck</a>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <main className="cozinha">
      <header className="cozinha-header">
        <h1>🍔 Painel da Cozinha</h1>
        <span className="badge">{orders.length} pedidos ativos</span>
      </header>

      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="empty">
            <span>🎉</span>
            <p>Nenhum pedido pendente!</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order._id} className={`order-card status-${order.status}`}>
              <div className="order-header">
                <strong>#{order._id.slice(-4).toUpperCase()}</strong>
                <span className="order-time">
                  {new Date(order._creationTime).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className="client-name">
                👤 {order.clientName}
                {order.clientPhone && (
                  <a
                    href={`https://wa.me/${order.clientPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp"
                    title="Contatar via WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .613.613l4.458-1.495A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75c-2.24 0-4.359-.734-6.102-2.105l-.426-.33-3.202 1.073 1.073-3.202-.33-.426A9.712 9.712 0 0 1 2.25 12 9.75 9.75 0 0 1 12 2.25 9.75 9.75 0 0 1 21.75 12 9.75 9.75 0 0 1 12 21.75z"/></svg>
                  </a>
                )}
              </p>

              {/* Cash payment pending badge */}
              {order.paymentMethod === "dinheiro" && order.paymentStatus === "pendente" && (
                <div className="cash-badge">
                  💵 Aguardando pagamento em dinheiro
                  <button
                    className="btn btn-cash"
                    onClick={() => confirmCash({ orderId: order._id })}
                  >
                    ✅ Recebi o pagamento
                  </button>
                </div>
              )}
              {order.paymentMethod === "dinheiro" && order.paymentStatus === "aprovado" && (
                <div className="cash-badge cash-confirmed">
                  ✅ Dinheiro recebido
                </div>
              )}

              <ul className="order-items">
                {order.items.map((item: any, i: number) => (
                  <li key={i}>
                    <span className="qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    {item.observations && (
                      <span className="obs">⚠️ {item.observations}</span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="order-footer">
                <span className="total">{formatPrice(order.totalPrice)}</span>
                <div className="actions">
                  {order.status === "recebido" && (
                    order.paymentMethod === "dinheiro" && order.paymentStatus === "pendente" ? (
                      <span className="waiting-label">⏳ Aguardando dinheiro</span>
                    ) : (
                      <button
                        className="btn btn-preparing"
                        onClick={() =>
                          updateStatus({ orderId: order._id, status: "preparando" })
                        }
                      >
                        👨‍🍳 Iniciar
                      </button>
                    )
                  )}
                  {order.status === "preparando" && (
                    <button
                      className="btn btn-ready"
                      onClick={() =>
                        updateStatus({ orderId: order._id, status: "pronto" })
                      }
                    >
                      🔔 Pronto!
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

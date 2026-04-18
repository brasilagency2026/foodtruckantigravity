"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatPrice, formatOrderStatus } from "shared/types";

export default function CozinhaPage() {
  const myTrucks = useQuery(api.foodTrucks.getMyTrucks);
  const truckId = myTrucks?.[0]?._id as Id<"foodTrucks"> | undefined;

  const orders = useQuery(
    api.orders.getActiveOrdersForTruck,
    truckId ? { truckId } : "skip"
  );

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

              <p className="client-name">👤 {order.clientName}</p>

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

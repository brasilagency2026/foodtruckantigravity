"use client";

import { useState } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";
import { SmartLanding } from "./SmartLanding";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  observations?: string;
  sku?: string;
  variationName?: string;
}

export default function MenuPage({
  params,
}: {
  params: { truckId: string };
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const truckId = params.truckId as Id<"foodTrucks">;
  const truck = useQuery(api.foodTrucks.getTruckById, { truckId });
  const menuGrouped = useQuery(api.menu.getMenuByTruck, { truckId });
  const searchParams = useSearchParams();
  const manual = searchParams?.get("manual") === "true";
  const clientNameFromQuery = searchParams?.get("clientName") ?? "";
  const clientPhoneFromQuery = searchParams?.get("clientPhone") ?? "";


  // Ajoute la catégorie "Todos" en premier
  const categories = menuGrouped ? ["Todos", ...Object.keys(menuGrouped)] : [];
  // Par défaut, sélectionne "Todos"
  const currentCategory = activeCategory ?? "Todos";

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(item: { _id: string; name: string; price: number; sku?: string }, variationName?: string, variationPrice?: number) {
    const cartKey = variationName ? `${item._id}__${variationName}` : item._id;
    const price = variationPrice ?? item.price;
    const displayName = variationName ? `${item.name} (${variationName})` : item.name;
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === cartKey
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        { menuItemId: cartKey, name: displayName, price, quantity: 1, sku: item.sku, variationName },
      ];
    });
  }

  function removeFromCart(menuItemId: string) {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function getQty(menuItemId: string) {
    return cart.find((i) => i.menuItemId === menuItemId)?.quantity ?? 0;
  }

  function getTotalQtyForItem(itemId: string) {
    return cart.filter((i) => i.menuItemId === itemId || i.menuItemId.startsWith(`${itemId}__`)).reduce((sum, i) => sum + i.quantity, 0);
  }

  if (!truck || !menuGrouped) {
    return <LoadingScreen />;
  }

  // Mostra a landing de download antes do cardápio (só mobile)
  if (!showMenu) {
    return (
      <SmartLanding
        truckId={params.truckId}
        truckName={truck.name}
        truckCuisine={truck.cuisine}
        coverPhotoUrl={truck.coverPhotoUrl}
        onContinueWeb={() => setShowMenu(true)}
      />
    );
  }

  return (
    <div style={s.page}>


      {/* Header do truck */}
      <div style={s.header}>
        {truck.coverPhotoUrl && (
          <img src={truck.coverPhotoUrl} alt={truck.name} style={s.cover} />
        )}
        <div style={s.headerOverlay} />
        <div style={s.headerContent}>
          <span style={s.openBadge}>
            {truck.isOpen ? "🟢 Aberto agora" : "🔴 Fechado"}
          </span>
          <h1 style={s.truckName}>{truck.name}</h1>
          <p style={s.truckMeta}>{truck.cuisine}</p>
        </div>
      </div>

      {/* Boutons infos truck */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "18px 0 10px 0" }}>
        <button style={s.infoBtn} onClick={() => setShowDetails(true)}>Detalhes</button>
        <button style={s.infoBtn} onClick={() => setShowHours(true)}>Horários</button>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(truck.address ?? truck.location ?? "")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...s.infoBtn, textDecoration: "none", display: "inline-block" }}
        >
          Google Maps
        </a>
      </div>

      {/* Modale Detalhes */}
      {showDetails && (
        <Modal onClose={() => setShowDetails(false)} title="Detalhes">
          <div style={{ padding: 16, color: "#222" }}>{truck.description || "Pas de description."}</div>
        </Modal>
      )}

      {/* Modale Horários */}
      {showHours && (
        <Modal onClose={() => setShowHours(false)} title="Horários">
          <div style={{ padding: 16, color: "#222" }}>
            {truck.openingHours ? (
              <div style={{ fontFamily: "inherit", lineHeight: 1.5 }}>
                {([
                  ["monday", "Segunda"],
                  ["tuesday", "Terça"],
                  ["wednesday", "Quarta"],
                  ["thursday", "Quinta"],
                  ["friday", "Sexta"],
                  ["saturday", "Sábado"],
                  ["sunday", "Domingo"],
                ] as Array<[string, string]>).map(([key, label]) => {
                  const day = (truck.openingHours as any)?.[key];
                  if (!day || !day.open || !day.close) {
                    return (
                      <div key={key} style={{ color: "rgba(0,0,0,0.6)" }}>
                        {label}: Fechado
                      </div>
                    );
                  }
                  return (
                    <div key={key}>
                      {label}: {day.open} — {day.close}
                    </div>
                  );
                })}
              </div>
            ) : (
              "Horários não informados."
            )}
          </div>
        </Modal>
      )}
      

      {/* Categorias */}

      <div style={s.categories}>
        {categories.map((cat) => (
          <button
            key={cat}
            style={{
              ...s.catBtn,
              ...(currentCategory === cat ? s.catBtnActive : {}),
            }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>


      {/* Itens do cardápio */}
      <div style={s.items}>
        {(currentCategory === "Todos"
          ? Object.values(menuGrouped).flat()
          : menuGrouped[currentCategory] ?? []
        ).map((item) => {
          const qty = getQty(item._id);
          const hasVariations = item.variations && item.variations.length > 0;
          const totalQty = getTotalQtyForItem(item._id);
          return (
            <div key={item._id} style={s.item}>
              {item.photoUrl && (
                <img src={item.photoUrl} alt={item.name} style={s.itemPhoto} />
              )}
              <div style={s.itemInfo}>
                <h3 style={s.itemName}>{item.name}</h3>
                <p style={s.itemDesc}>{item.description}</p>
                {hasVariations ? (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "block" }}>
                      A partir de {formatPrice(Math.min(item.price, ...item.variations!.map((v: any) => v.price)))}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {item.variations!.map((v: any, vi: number) => {
                        const vKey = `${item._id}__${v.name}`;
                        const vQty = getQty(vKey);
                        return (
                          <div key={vi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "6px 10px" }}>
                            <div>
                              <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>{v.name}</span>
                              <span style={{ color: "#FF6B35", fontSize: 13, fontWeight: 700, marginLeft: 8 }}>{formatPrice(v.price)}</span>
                            </div>
                            {vQty === 0 ? (
                              <button style={{ ...s.addBtn, padding: "4px 12px", fontSize: 12 }} onClick={() => addToCart(item, v.name, v.price)}>+</button>
                            ) : (
                              <div style={s.qtyControl}>
                                <button style={s.qtyBtn} onClick={() => removeFromCart(vKey)}>−</button>
                                <span style={s.qtyNum}>{vQty}</span>
                                <button style={s.qtyBtn} onClick={() => addToCart(item, v.name, v.price)}>+</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {totalQty > 0 && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4, display: "block" }}>{totalQty} no carrinho</span>}
                  </div>
                ) : (
                <div style={s.itemFooter}>
                  <span style={s.itemPrice}>{formatPrice(item.price)}</span>
                  {qty === 0 ? (
                    <button style={s.addBtn} onClick={() => addToCart(item)}>
                      + Adicionar
                    </button>
                  ) : (
                    <div style={s.qtyControl}>
                      <button style={s.qtyBtn} onClick={() => removeFromCart(item._id)}>−</button>
                      <span style={s.qtyNum}>{qty}</span>
                      <button style={s.qtyBtn} onClick={() => addToCart(item)}>+</button>
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <button style={s.cartFloat} onClick={() => setShowCart(true)}>
          <span style={s.cartBadge}>{cartCount}</span>
          Ver carrinho
          <span style={s.cartTotal}>{formatPrice(cartTotal)}</span>
        </button>
      )}

      {/* Drawer do carrinho */}
      {showCart && (
        <CartDrawer
          cart={cart}
          truck={truck}
          truckId={truckId}
          manual={manual}
          clientName={clientNameFromQuery}
          clientPhone={clientPhoneFromQuery}
          onClose={() => setShowCart(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}

// ============================================
// CART DRAWER
// ============================================
function CartDrawer({
  cart,
  truck,
  truckId,
  manual,
  clientName,
  clientPhone,
  onClose,
  onAdd,
  onRemove,
}: {
  cart: CartItem[];
  truck: { name: string };
  truckId: string;
  manual?: boolean;
  clientName?: string;
  clientPhone?: string;
  onClose: () => void;
  onAdd: (item: any) => void;
  onRemove: (id: string) => void;
}) {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div style={s.drawerBackdrop} onClick={onClose}>
      <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
        <div style={s.drawerHandle} />
        <h2 style={s.drawerTitle}>Seu pedido</h2>
        <p style={s.drawerTruck}>{truck.name}</p>

        <div style={s.drawerItems}>
          {cart.map((item) => (
            <div key={item.menuItemId} style={s.drawerItem}>
              <div style={s.drawerItemInfo}>
                <span style={s.drawerItemName}>{item.name}</span>
                <span style={s.drawerItemPrice}>{formatPrice(item.price)}</span>
              </div>
              <div style={s.qtyControl}>
                <button style={s.qtyBtn} onClick={() => onRemove(item.menuItemId)}>−</button>
                <span style={s.qtyNum}>{item.quantity}</span>
                <button style={s.qtyBtn} onClick={() => onAdd(item)}>+</button>
              </div>
            </div>
          ))}
        </div>

        <div style={s.drawerTotal}>
          <span>Total</span>
          <span style={s.drawerTotalVal}>{formatPrice(total)}</span>
        </div>

        {
          (() => {
            const base = `/checkout?items=${encodeURIComponent(JSON.stringify(cart))}&truckId=${truckId}`;
            const href = manual
              ? base + `&manual=true&clientName=${encodeURIComponent(clientName ?? "")}&clientPhone=${encodeURIComponent(clientPhone ?? "")}`
              : base;
            return (
              <a href={href} style={s.checkoutBtn}>
                Ir para pagamento →
              </a>
            );
          })()
        }
      </div>
    </div>
  );
}

// ============================================
// LOADING
// ============================================
function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", fontSize: 14 }}>
        Carregando cardápio...
      </div>
    </div>
  );
}

// Modal générique
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 12, minWidth: 320, maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", position: "relative" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "16px 20px 0 20px", fontWeight: 700, fontSize: 18, borderBottom: "1px solid #eee" }}>{title}</div>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", fontSize: 22, color: "#888", cursor: "pointer" }}>&times;</button>
        <div>{children}</div>
      </div>
    </div>
  );
}

// ============================================
// STYLES
// ============================================
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0D0D0D",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    paddingBottom: 120,
  },
  header: {
    position: "relative",
    height: 220,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  headerOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, transparent, rgba(13,13,13,0.97))",
  },
  headerContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  openBadge: {
    fontSize: 12,
    fontWeight: 600,
    display: "block",
    marginBottom: 6,
    color: "rgba(255,255,255,0.7)",
  },
  truckName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    fontFamily: "'Syne', system-ui",
  },
  truckMeta: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    margin: "4px 0 0",
  },
  categories: {
    display: "flex",
    gap: 8,
    padding: "16px 20px",
    overflowX: "auto",
    scrollbarWidth: "none",
  },
  catBtn: {
    padding: "8px 16px",
    borderRadius: 100,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  catBtnActive: {
    background: "#FF6B35",
    border: "1px solid #FF6B35",
    color: "#FFFFFF",
  },
  infoBtn: {
    padding: "8px 18px",
    background: "#222",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  items: {
    padding: "0 20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  item: {
    background: "#1A1A1A",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
  },
  itemPhoto: {
    width: 110,
    height: 110,
    objectFit: "cover",
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
  },
  itemName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 600,
    margin: "0 0 4px",
  },
  itemDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    margin: "0 0 4px",
    lineHeight: 1.4,
    flex: 1,
  },
  allergens: {
    color: "rgba(255,180,50,0.7)",
    fontSize: 11,
    margin: "0 0 8px",
  },
  itemFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    color: "#FF6B35",
    fontWeight: 700,
    fontSize: 15,
  },
  addBtn: {
    padding: "6px 14px",
    background: "#FF6B35",
    color: "#FFF",
    border: "none",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: "4px 8px",
  },
  qtyBtn: {
    background: "none",
    border: "none",
    color: "#FF6B35",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    padding: "0 2px",
    lineHeight: 1,
  },
  qtyNum: {
    color: "#FFF",
    fontWeight: 600,
    fontSize: 14,
    minWidth: 16,
    textAlign: "center",
  },
  cartFloat: {
    position: "fixed",
    bottom: 24,
    left: 20,
    right: 20,
    background: "#FF6B35",
    color: "#FFF",
    border: "none",
    borderRadius: 16,
    padding: "18px 24px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 32px rgba(255,107,53,0.5)",
    fontFamily: "inherit",
    zIndex: 100,
  },
  cartBadge: {
    background: "rgba(0,0,0,0.25)",
    borderRadius: 100,
    padding: "2px 10px",
    fontSize: 13,
  },
  cartTotal: {
    fontWeight: 800,
    fontSize: 16,
  },
  drawerBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 200,
    display: "flex",
    alignItems: "flex-end",
  },
  drawer: {
    background: "#1A1A1A",
    borderRadius: "24px 24px 0 0",
    padding: "16px 24px 48px",
    width: "100%",
    animation: "slideUp 0.3s ease",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  drawerHandle: {
    width: 40,
    height: 4,
    background: "rgba(255,255,255,0.15)",
    borderRadius: 100,
    margin: "0 auto 20px",
  },
  drawerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 4px",
    fontFamily: "'Syne', system-ui",
  },
  drawerTruck: {
    color: "#FF6B35",
    fontSize: 13,
    margin: "0 0 20px",
    fontWeight: 500,
  },
  drawerItems: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 24,
  },
  drawerItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerItemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  drawerItemName: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: 600,
  },
  drawerItemPrice: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
  },
  drawerTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 20,
  },
  drawerTotalVal: {
    color: "#FFF",
    fontWeight: 800,
    fontSize: 18,
  },
  checkoutBtn: {
    display: "block",
    width: "100%",
    padding: "18px",
    background: "#FF6B35",
    color: "#FFF",
    borderRadius: 14,
    textAlign: "center",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 16,
    boxShadow: "0 8px 24px rgba(255,107,53,0.35)",
    boxSizing: "border-box",
  },
};

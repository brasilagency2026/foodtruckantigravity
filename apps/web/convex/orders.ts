import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// QUERIES — reativas em tempo real ⚡
// ============================================

// Cliente acompanha SEU pedido ao vivo
export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db.get(orderId);
  },
});

// Cozinha vê TODOS os pedidos ativos ao vivo
export const getActiveOrdersForTruck = query({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    const active = await ctx.db
      .query("orders")
      .withIndex("by_truck_status", (q) =>
        q.eq("truckId", truckId).eq("status", "recebido")
      )
      .collect();

    const preparing = await ctx.db
      .query("orders")
      .withIndex("by_truck_status", (q) =>
        q.eq("truckId", truckId).eq("status", "preparando")
      )
      .collect();

    return [...active, ...preparing].sort((a, b) => 
      a._creationTime - b._creationTime
    );
  },
});

// Histórico do dia para o dono do truck
export const getTodayOrdersForTruck = query({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return await ctx.db
      .query("orders")
      .withIndex("by_truck", (q) => q.eq("truckId", truckId))
      .filter((q) => q.gte(q.field("_creationTime"), startOfDay.getTime()))
      .order("desc")
      .collect();
  },
});

// Historique des commandes du client
export const getOrdersByClient = query({
  args: { clientId: v.string() },
  handler: async (ctx, { clientId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_client", (q) => q.eq("clientId", clientId))
      .order("desc")
      .take(30);
  },
});

// Find order by Mercado Pago payment ID (used by webhook)
export const getOrderByPaymentId = query({
  args: { mercadoPagoPaymentId: v.string() },
  handler: async (ctx, { mercadoPagoPaymentId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_payment", (q) =>
        q.eq("mercadoPagoPaymentId", mercadoPagoPaymentId)
      )
      .first();
  },
});

// ============================================
// MUTATIONS
// ============================================

// Cliente faz um pedido
export const createOrder = mutation({
  args: {
    truckId: v.id("foodTrucks"),
    clientId: v.string(),
    clientName: v.string(),
    clientPhone: v.string(),
    items: v.array(v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      observations: v.optional(v.string()),
    })),
    totalPrice: v.number(),
    paymentMethod: v.union(
      v.literal("pix"),
      v.literal("cartao_credito"),
      v.literal("cartao_debito")
    ),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "recebido",
      paymentStatus: "pendente",
    });
    return orderId;
  },
});

// Cozinha atualiza o status do pedido
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("preparando"),
      v.literal("pronto"),
      v.literal("entregue"),
      v.literal("cancelado")
    ),
    estimatedTime: v.optional(v.number()),
  },
  handler: async (ctx, { orderId, status, estimatedTime }) => {
    await ctx.db.patch(orderId, {
      status,
      ...(estimatedTime ? { estimatedTime } : {}),
    });
  },
});

// Webhook Mercado Pago confirma pagamento
export const confirmPayment = mutation({
  args: {
    mercadoPagoPaymentId: v.string(),
    paymentStatus: v.union(
      v.literal("aprovado"),
      v.literal("recusado"),
      v.literal("reembolsado"),
      v.literal("pendente")
    ),
  },
  handler: async (ctx, { mercadoPagoPaymentId, paymentStatus }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_payment", (q) =>
        q.eq("mercadoPagoPaymentId", mercadoPagoPaymentId)
      )
      .first();

    if (!order) throw new Error("Pedido não encontrado");

    await ctx.db.patch(order._id, { paymentStatus });
  },
});

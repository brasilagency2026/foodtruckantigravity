import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

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

// Conta quantos pedidos estão na frente do pedido atual
export const getQueuePosition = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return null;

    // Só conta a fila se o pedido ainda está em espera ou preparação
    if (order.status !== "recebido" && order.status !== "preparando") {
      return 0;
    }

    // Buscar pedidos "recebido" e "preparando" do mesmo truck
    const recebidos = await ctx.db
      .query("orders")
      .withIndex("by_truck_status", (q) =>
        q.eq("truckId", order.truckId).eq("status", "recebido")
      )
      .collect();

    const preparando = await ctx.db
      .query("orders")
      .withIndex("by_truck_status", (q) =>
        q.eq("truckId", order.truckId).eq("status", "preparando")
      )
      .collect();

    // Filtrar: même logique que la cuisine
    // - Seulement les commandes payées, manuelles ou en espèces
    // - Seulement les commandes des dernières 12h (pas les vieux abandonnés)
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;

    const ahead = [...recebidos, ...preparando].filter(
      (o) =>
        o._id !== orderId &&
        o._creationTime < order._creationTime &&
        o._creationTime > twelveHoursAgo &&
        (o.manual === true || o.paymentStatus === "aprovado" || o.paymentMethod === "dinheiro")
    );

    return ahead.length;
  },
});

export const getOrdersByIds = query({
  args: { orderIds: v.array(v.id("orders")) },
  handler: async (ctx, { orderIds }) => {
    const orders = await Promise.all(orderIds.map(id => ctx.db.get(id)));
    return orders.filter(Boolean);
  },
});

// Cozinha vê TODOS os pedidos ativos ao vivo
// Só mostra pedidos com pagamento confirmado (ou dinheiro)
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

    const ready = await ctx.db
      .query("orders")
      .withIndex("by_truck_status", (q) =>
        q.eq("truckId", truckId).eq("status", "pronto")
      )
      .collect();

    // Filtrer: afficher les commandes marquées `manual`, payées OU en espèces
    const all = [...active, ...preparing, ...ready].filter(
      (o) => o.manual === true || o.paymentStatus === "aprovado" || o.paymentMethod === "dinheiro"
    );

    return all.sort((a, b) => a._creationTime - b._creationTime);
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
      sku: v.optional(v.string()),
      variationName: v.optional(v.string()),
    })),
    totalPrice: v.number(),
    paymentMethod: v.union(
      v.literal("pix"),
      v.literal("cartao_credito"),
      v.literal("cartao_debito"),
      v.literal("dinheiro")
    ),
    manual: v.optional(v.boolean()),
    paymentReceived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Avoid inserting any unexpected client-only fields (like `paymentReceived`).
    const {
      truckId,
      clientId,
      clientName,
      clientPhone,
      items,
      totalPrice,
      paymentMethod,
      manual,
    } = args as any;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const lastOrder = await ctx.db
      .query("orders")
      .withIndex("by_truck", (q) => q.eq("truckId", truckId))
      .filter((q) => q.gte(q.field("_creationTime"), startOfDay.getTime()))
      .order("desc")
      .first();

    const nextNumber = (lastOrder?.orderNumber ?? 0) + 1;

    const orderId = await ctx.db.insert("orders", {
      truckId,
      clientId,
      clientName,
      clientPhone,
      items,
      totalPrice,
      paymentMethod,
      manual,
      status: "recebido",
      paymentStatus: "pendente",
      orderNumber: nextNumber,
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

    if (status === "pronto") {
      await ctx.scheduler.runAfter(0, api.notifications.sendPushNotification, {
        orderId,
        title: "Seu pedido está pronto! ✅",
        body: "Retire-o agora no balcão do food truck. 🍔",
      });
    }
  },
});

// Link Mercado Pago payment ID to an order (called right after MP API returns)
export const linkPaymentId = mutation({
  args: {
    orderId: v.id("orders"),
    mercadoPagoPaymentId: v.string(),
  },
  handler: async (ctx, { orderId, mercadoPagoPaymentId }) => {
    await ctx.db.patch(orderId, { mercadoPagoPaymentId });
  },
});

// Cozinha confirma recebimento de pagamento em dinheiro
export const confirmCashPayment = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, { orderId }) => {
    await ctx.db.patch(orderId, { paymentStatus: "aprovado" });
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

// Marca manual flag em uma order já criada
export const markOrderManual = mutation({
  args: {
    orderId: v.id("orders"),
    manual: v.boolean(),
  },
  handler: async (ctx, { orderId, manual }) => {
    await ctx.db.patch(orderId, { manual });
  },
});

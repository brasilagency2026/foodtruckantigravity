import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// ============================================
// CRÉER UN PAIEMENT MERCADO PAGO
// ============================================

export const createPayment = action({
  args: {
    orderId: v.id("orders"),
    truckId: v.id("foodTrucks"),
    totalPrice: v.number(),      // em centavos
    clientEmail: v.string(),
    clientName: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Fetch the truck's Mercado Pago access token
    const truck = await ctx.runQuery(api.foodTrucks.getTruckById, { truckId: args.truckId });
    if (!truck?.mpAccessToken) {
      throw new Error("Este truck não tem Mercado Pago conectado.");
    }
    const accessToken = truck.mpAccessToken;

    // Use Checkout Pro — MP handles Pix, credit, debit, everything
    const preferenceData = {
      items: [
        {
          title: args.description,
          quantity: 1,
          unit_price: args.totalPrice / 100, // MP uses reais, not centavos
          currency_id: "BRL",
        },
      ],
      payer: {
        email: args.clientEmail,
        name: args.clientName,
      },
      external_reference: args.orderId,
      notification_url: `https://www.foodpronto.com.br/api/webhooks/mercadopago`,
      back_urls: {
        success: `https://www.foodpronto.com.br/order/${args.orderId}`,
        failure: `https://www.foodpronto.com.br/order/${args.orderId}`,
        pending: `https://www.foodpronto.com.br/order/${args.orderId}`,
      },
      auto_return: "approved",
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preferenceData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erro Mercado Pago: ${JSON.stringify(data)}`);
    }

    // Return the checkout URL — client redirects to MP
    return {
      checkoutUrl: data.init_point,
      preferenceId: data.id,
    };
  },
});

// ============================================
// WEBHOOK — Mercado Pago notifie le statut
// Route: /api/webhooks/mercadopago (Next.js)
// ============================================

export const handleWebhook = mutation({
  args: {
    mercadoPagoPaymentId: v.string(),
    status: v.string(), // "approved", "rejected", "refunded"...
    paymentMethod: v.optional(v.union(
      v.literal("pix"),
      v.literal("cartao_credito"),
      v.literal("cartao_debito"),
      v.literal("dinheiro")
    )),
  },
  handler: async (ctx, { mercadoPagoPaymentId, status, paymentMethod }) => {
    const statusMap: Record<string, "aprovado" | "recusado" | "reembolsado"> = {
      approved: "aprovado",
      rejected: "recusado",
      refunded: "reembolsado",
      cancelled: "recusado",
    };
    const paymentStatus = statusMap[status];
    if (!paymentStatus) return;

    const order = await ctx.db
      .query("orders")
      .withIndex("by_payment", (q) =>
        q.eq("mercadoPagoPaymentId", mercadoPagoPaymentId)
      )
      .first();

    if (!order) return;

    const patchFields: any = { paymentStatus };
    // If webhook provided a resolved payment method, persist it
    // (cartão / pix / débito)
    if (paymentMethod) {
      patchFields.paymentMethod = paymentMethod;
    }

    await ctx.db.patch(order._id, patchFields);

    // If payment approved → change order status to recebido so kitchen sees it
    if (paymentStatus === "aprovado") {
      await ctx.db.patch(order._id, { status: "recebido" });
    }
  },
});

// ============================================
// STATS du jour pour le propriétaire
// ============================================

export const getDailyStats = query({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_truck", (q) => q.eq("truckId", truckId))
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startOfDay.getTime()),
          q.eq(q.field("paymentStatus"), "aprovado")
        )
      )
      .collect();

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;

    // Item le plus vendu
    const itemCount: Record<string, { name: string; count: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!itemCount[item.menuItemId]) {
          itemCount[item.menuItemId] = { name: item.name, count: 0 };
        }
        itemCount[item.menuItemId].count += item.quantity;
      }
    }

    const topItem = Object.values(itemCount).sort((a, b) => b.count - a.count)[0];

    return {
      totalRevenue,   // em centavos
      totalOrders,
      topItem: topItem ?? null,
    };
  },
});

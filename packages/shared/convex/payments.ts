import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// ============================================
// CRÉER UN PAIEMENT MERCADO PAGO
// ============================================

export const createPayment = action({
  args: {
    orderId: v.id("orders"),
    totalPrice: v.number(),      // em centavos
    paymentMethod: v.union(
      v.literal("pix"),
      v.literal("cartao_credito"),
      v.literal("cartao_debito")
    ),
    clientEmail: v.string(),
    clientName: v.string(),
    description: v.string(),     // ex: "Pedido #ABC123 - Food Truck X"
  },
  handler: async (ctx, args) => {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

    const paymentData: Record<string, unknown> = {
      transaction_amount: args.totalPrice / 100, // Mercado Pago usa reais, não centavos
      description: args.description,
      external_reference: args.orderId,
      payer: {
        email: args.clientEmail,
        first_name: args.clientName.split(" ")[0],
        last_name: args.clientName.split(" ").slice(1).join(" "),
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    };

    if (args.paymentMethod === "pix") {
      paymentData.payment_method_id = "pix";
    }

    const response = await fetch(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Idempotency-Key": args.orderId,
        },
        body: JSON.stringify(paymentData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erro Mercado Pago: ${data.message}`);
    }

    // Salvar o ID do pagamento no pedido
    await ctx.runMutation(api.orders.confirmPayment, {
      mercadoPagoPaymentId: String(data.id),
      paymentStatus: "pendente",
    });

    // Retornar dados necessários para o cliente
    return {
      paymentId: data.id,
      status: data.status,
      // Para Pix: QR Code
      pixQrCode: data.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      // Para cartão: URL de checkout
      checkoutUrl: data.init_point,
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
    const statusMap: Record<string, "aprovado" | "recusado" | "reembolsado" | "pendente"> = {
      approved: "aprovado",
      in_process: "pendente",
      pending: "pendente",
      rejected: "recusado",
      cancelled: "recusado",
      refunded: "reembolsado",
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
    if (paymentMethod) patchFields.paymentMethod = paymentMethod;

    await ctx.db.patch(order._id, patchFields);

    // If approved, set the order status so it appears in the kitchen
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

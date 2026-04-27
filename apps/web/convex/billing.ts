import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { ConvexError } from "convex/values";

export const createCheckoutUrl = action({
  args: {
    truckId: v.id("foodTrucks"),
    plan: v.union(v.literal("monthly"), v.literal("annual")),
    method: v.union(v.literal("cc"), v.literal("pix")),
    voucherCode: v.optional(v.string()),
    totalAmount: v.number(), // The final price after discounts
  },
  handler: async (ctx, args) => {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new ConvexError("A chave de acesso do Mercado Pago (MERCADO_PAGO_ACCESS_TOKEN) não está configurada no servidor Convex.");
    }

    const backUrl = `https://www.foodpronto.com.br/dashboard/${args.truckId}/assinatura`;
    let checkoutUrl = "";

    // Generate external reference to identify this later
    const extRef = `${args.truckId}|${args.plan}|${args.voucherCode || "none"}`;

    const truck = await ctx.runQuery(api.foodTrucks.getTruckById, { truckId: args.truckId });
    if (!truck) {
      throw new ConvexError("Food Truck não encontrado.");
    }
    
    // Detect if we are using a test token or production token
    const isTestMode = accessToken.startsWith("TEST-");
    
    // Get the identity of the logged-in user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Você precisa estar logado para realizar o pagamento.");
    }
    
    // For Test Mode, Mercado Pago REQUIRES a test user email.
    // For Production, it requires a real email (and NOT the collector's email).
    const payerEmail = isTestMode 
      ? "test_user_12345678@testuser.com" // Generic MP test email
      : (identity.email || `cliente_${args.truckId}@foodpronto.com.br`);

    if (args.plan === "monthly" && args.method === "cc") {
      // Create a Preapproval (Recurring Subscription) for Credit Card
      const response = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: `Assinatura Mensal - Food Pronto`,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: args.totalAmount,
            currency_id: "BRL",
          },
          back_url: backUrl,
          external_reference: extRef,
          payer_email: payerEmail,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("MP Preapproval Error:", errorText);
        throw new ConvexError(`Falha ao gerar link de assinatura (MP: ${errorText})`);
      }

      const data = await response.json();
      checkoutUrl = data.init_point;
    } else {
      // Create a Checkout Preference for one-time PIX or Annual plans
      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: args.plan === "annual" ? "Assinatura Anual - Food Pronto" : "Assinatura Mensal - Food Pronto",
              quantity: 1,
              unit_price: args.totalAmount,
              currency_id: "BRL",
            },
          ],
          payer: {
            email: payerEmail,
          },
          back_urls: {
            success: backUrl + "?status=success",
            failure: backUrl + "?status=failure",
            pending: backUrl + "?status=pending",
          },
          auto_return: "approved",
          external_reference: extRef,
          payment_methods: args.method === "pix" ? {
            included_payment_methods: [{ id: "pix" }],
            installments: 1,
          } : undefined,
          notification_url: "https://www.foodpronto.com.br/api/webhooks/billing", // Custom webhook route
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("MP Preference Error:", errorText);
        throw new ConvexError(`Falha ao gerar link de pagamento (MP: ${errorText})`);
      }

      const data = await response.json();
      checkoutUrl = data.init_point; // Redirect user here
    }

    return checkoutUrl;
  },
});

export const handleBillingWebhook = mutation({
  args: {
    externalReference: v.string(), // "truckId|plan|voucherCode"
    mpPaymentId: v.string(),
  },
  handler: async (ctx, args) => {
    const parts = args.externalReference.split("|");
    if (parts.length < 2) return;
    
    const truckIdStr = parts[0];
    const plan = parts[1] as "monthly" | "annual";
    const voucherCode = parts[2] !== "none" ? parts[2] : null;

    const truckId = ctx.db.normalizeId("foodTrucks", truckIdStr);
    if (!truckId) return;

    const truck = await ctx.db.get(truckId);
    if (!truck) return;

    // Extend trial Ends or nextPaymentAt
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    
    const newNextPayment = truck.nextPaymentAt && truck.nextPaymentAt > now 
      ? truck.nextPaymentAt + (plan === "annual" ? oneYear : oneMonth)
      : now + (plan === "annual" ? oneYear : oneMonth);

    await ctx.db.patch(truckId, {
      nextPaymentAt: newNextPayment,
      subscriptionStatus: "active",
      isActive: true, // Auto-activate if suspended
    });

    // Handle Commissions
    if (voucherCode) {
      const voucher = await ctx.db
        .query("vouchers")
        .withIndex("by_code", (q) => q.eq("code", voucherCode))
        .first();

      if (voucher && voucher.isActive) {
        // Calculate commission amount
        // Annual is 1920, Monthly is 200
        const basePrice = plan === "annual" ? 1920 : 200;
        const priceAfterDiscount = basePrice - (basePrice * (voucher.discountPercentage / 100));
        const commissionAmount = priceAfterDiscount * (voucher.commissionPercentage / 100);

        await ctx.db.insert("commissions", {
          partnerId: voucher._id,
          truckId: truckId,
          amount: commissionAmount,
          status: "pending",
          paymentDate: now,
          paymentType: plan,
          mercadopagoPaymentId: args.mpPaymentId,
        });

        // Trigger email
        await ctx.scheduler.runAfter(0, internal.emails.sendNewCommissionEmail, {
          partnerName: voucher.partnerName,
          partnerPhone: voucher.partnerPhone,
          amount: commissionAmount,
          truckName: truck.name,
          paymentType: plan,
        });
      }
    }
  },
});

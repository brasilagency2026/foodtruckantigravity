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
    payerEmail: v.optional(v.string()), // Optional override for MP email
    testMode: v.optional(v.boolean()), // If true, use sandbox credentials
  },
  handler: async (ctx, args) => {
    console.log("Billing Action: createCheckoutUrl v1.6", { plan: args.plan, method: args.method, testMode: args.testMode });
    
    // Use test token if testMode is active
    const accessToken = (args.testMode && process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST)
      ? process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST?.trim()
      : process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
      
    console.log("Using Access Token starting with:", accessToken?.substring(0, 15));
      
    if (!accessToken) {
      throw new ConvexError("Configuração do Mercado Pago incompleta (Token ausente).");
    }
    
    const backUrl = `https://foodpronto.com.br/dashboard/${args.truckId}/assinatura`;
    let checkoutUrl = "";

    // Generate external reference to identify this later (using - instead of | for safety)
    const extRef = `${args.truckId}-${args.plan}-${args.voucherCode || "none"}`;

    const truck = await ctx.runQuery(api.foodTrucks.getTruckById, { truckId: args.truckId });
    if (!truck) {
      throw new ConvexError("Food Truck não encontrado.");
    }
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity && !args.payerEmail) {
      throw new ConvexError("Sessão expirada. Por favor, faça login novamente.");
    }
    
    // Ensure we have a valid email or fallback
    const payerEmail = args.payerEmail || identity.email || "contato@foodpronto.com.br";
    
    // In Sandbox, using "APRO" as first name can trigger automatic approval
    const firstName = args.testMode ? "APRO" : (identity?.firstName || "Cliente");

    if (args.plan === "monthly" && args.method === "cc") {
      // Create a Preapproval (Recurring Subscription) for Credit Card
      // We use the email provided by the user to avoid "Email mismatch" errors.
      const finalPayerEmail = payerEmail;
      
      const body = {
        reason: "Serviço Food Pronto",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: Number(args.totalAmount.toFixed(2)),
          currency_id: "BRL",
        },
        payer_email: payerEmail,
        back_url: backUrl,
        external_reference: extRef,
        status: "pending",
      };

      console.log("MP Preapproval Request (v1.9):", JSON.stringify(body));

      const response = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log("MP Preapproval Response (v1.9):", JSON.stringify(data));

      if (!response.ok) {
        throw new ConvexError(`Falha ao gerar link de assinatura (MP: ${JSON.stringify(data)})`);
      }

      checkoutUrl = data.init_point;
    } else {
      // Create a Checkout Preference for Annual or PIX
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
              unit_price: Number(args.totalAmount.toFixed(2)),
              currency_id: "BRL",
            },
          ],
          back_urls: {
            success: backUrl + "?status=success",
            failure: backUrl + "?status=failure",
            pending: backUrl + "?status=pending",
          },
          auto_return: "approved",
          external_reference: extRef,
          notification_url: "https://foodpronto.com.br/api/webhooks/billing",
          payer: {
            email: payerEmail,
            first_name: firstName,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ConvexError(`Falha ao gerar link de paiement (MP: ${errorText})`);
      }

      const data = await response.json();
      checkoutUrl = data.init_point;
    }
    return checkoutUrl;
  },
});

export const handleBillingWebhook = mutation({
  args: {
    externalReference: v.string(), // "truckId|plan|voucherCode"
    mpPaymentId: v.string(),
    amount: v.optional(v.number()), // Amount actually paid in BRL
    mpPreapprovalId: v.optional(v.string()), // ID of the subscription
  },
  handler: async (ctx, args) => {
    console.log("Billing Mutation: handleBillingWebhook v1.2", { extRef: args.externalReference, amount: args.amount });
    // Support both | and - as delimiters for backward compatibility during transition
    const parts = args.externalReference.includes("-") 
      ? args.externalReference.split("-")
      : args.externalReference.split("|");
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
      mpPreapprovalId: args.mpPreapprovalId ?? truck.mpPreapprovalId,
    });

    // Send confirmation email to owner
    await ctx.scheduler.runAfter(0, internal.emails.sendSubscriptionEmail, {
      ownerId: truck.ownerId,
      truckName: truck.name,
      plan: plan,
      amount: args.amount ?? (plan === "monthly" ? 10 : 100),
      nextPaymentAt: newNextPayment,
    });

    // Handle Commissions
    if (voucherCode) {
      const voucher = await ctx.db
        .query("vouchers")
        .withIndex("by_code", (q) => q.eq("code", voucherCode))
        .first();

      if (voucher && voucher.isActive) {
        // Calculate commission amount
        // If amount is passed from webhook (real payment), use it directly.
        // Otherwise fallback to hardcoded base prices (legacy/safety).
        const basePrice = plan === "annual" ? 100 : 10;
        const priceAfterDiscount = basePrice - (basePrice * (voucher.discountPercentage / 100));
        
        const finalAmountForCommission = args.amount ?? priceAfterDiscount;
        const commissionAmount = finalAmountForCommission * (voucher.commissionPercentage / 100);

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
export const checkPaymentStatus = action({
  args: {
    paymentId: v.string(),
    truckId: v.id("foodTrucks"),
    testMode: v.boolean(),
  },
  handler: async (ctx, args) => {
    const accessToken = args.testMode 
      ? process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST 
      : process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) return { status: "error", message: "Token missing" };

    try {
      console.log(`Checking payment status for ${args.paymentId}...`);
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${args.paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        // Try preapproval if payment not found
        const preRes = await fetch(`https://api.mercadopago.com/preapproval/${args.paymentId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (preRes.ok) {
          const pre = await preRes.json();
          if (pre.status === "authorized" || pre.status === "active") {
            await ctx.runMutation(api.billing.handleBillingWebhook, {
              externalReference: pre.external_reference,
              mpPaymentId: pre.id,
              amount: pre.auto_recurring?.transaction_amount,
              mpPreapprovalId: pre.id,
            });
            return { status: "approved" };
          }
          return { status: pre.status };
        }
        return { status: "not_found" };
      }

      const payment = await response.json();
      console.log(`Payment ${args.paymentId} status: ${payment.status}`);
      if (payment.status === "approved" || payment.status === "authorized") {
        await ctx.runMutation(api.billing.handleBillingWebhook, {
          externalReference: payment.external_reference,
          mpPaymentId: String(payment.id),
          amount: payment.transaction_amount,
          mpPreapprovalId: payment.metadata?.preapproval_id || payment.order?.id,
        });
        return { status: "approved" };
      }
      return { status: payment.status };
    } catch (e) {
      console.error("CheckPaymentStatus error:", e);
      return { status: "error" };
    }
  },
});

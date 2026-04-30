import { NextRequest, NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Lazily create Convex client to avoid running browser-only code at import time
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud");

    const body = await req.text();
    let data: any;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error("Webhook: invalid JSON body", e);
      return NextResponse.json({ ok: true });
    }

    const signature = req.headers.get("x-signature") ?? req.headers.get("x-hub-signature") ?? "";
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    // We skip HMAC validation because Mercado Pago's signature format requires a specific manifest (id, request-id, ts)
    // and we already securely fetch the payment details directly from Mercado Pago's API below.
    if (secret && signature) {
      console.log("Webhook: Received signature, skipping HMAC validation in favor of API fetch.");
    }

    // Extract payment id from several possible shapes
    const paymentId = data?.data?.id ?? data?.id ?? data?.payment_id;
    if (!paymentId) {
      console.log("Webhook: no payment id present, ignoring", { data });
      return NextResponse.json({ ok: true });
    }

    // Try to find the truck. Prefer payload user_id (merchant) if present.
    const userId = data?.user_id ?? data?.user?.id;
    let truck: any | null = null;

    if (userId) {
      try {
        const trucks = await convex.query(api.foodTrucks.getAllTrucks, {});
        truck = (trucks ?? []).find((t: any) => String(t.mpUserId) === String(userId));
      } catch (e) {
        console.error("Webhook: error fetching trucks to match user_id", e);
      }
    }

    // If we still don't have a truck, try to find order by payment id (maybe linked)
    let order: any | null = null;
    if (!truck) {
      try {
        order = await convex.query(api.orders.getOrderByPaymentId, { mercadoPagoPaymentId: String(paymentId) });
        if (order) {
          truck = await convex.query(api.foodTrucks.getTruckById, { truckId: order.truckId });
        }
      } catch (e) {
        console.error("Webhook: error finding order by payment id", e);
      }
    }

    // If we still don't know the truck, we cannot fetch the payment by merchant token.
    // Try to proceed best-effort: if truck found, fetch MP payment details.
    let payment: any | null = null;
    const tokenToUse = truck?.mpAccessToken ?? process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (tokenToUse) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${tokenToUse}` },
        });
        if (!mpRes.ok) {
          console.error("Webhook: MP fetch failed", await mpRes.text());
          return NextResponse.json({ ok: true });
        }
        payment = await mpRes.json();
      } catch (e) {
        console.error("Webhook: error fetching MP payment", e);
        return NextResponse.json({ ok: true });
      }
    } else {
      console.warn("Webhook: no MP access token available (truck or global); cannot fetch payment details");
    }

    if (!payment) {
      console.log("Webhook: no payment details available, ignoring");
      return NextResponse.json({ ok: true });
    }

    // Determine order id from payment.external_reference (preference external_reference)
    let externalReference = payment.external_reference ?? null;

    // If external_reference not present but we have a preference_id, fetch the preference
    // to retrieve the external_reference we set when creating the preference.
    if (!externalReference && payment.preference_id && truck?.mpAccessToken) {
      try {
        const prefRes = await fetch(
          `https://api.mercadopago.com/checkout/preferences/${payment.preference_id}`,
          { headers: { Authorization: `Bearer ${truck.mpAccessToken}` } }
        );
        if (prefRes.ok) {
          const pref = await prefRes.json();
          externalReference = pref.external_reference ?? pref.externalReference ?? null;
        } else {
          console.warn("Webhook: preference fetch failed", await prefRes.text());
        }
      } catch (e) {
        console.warn("Webhook: preference fetch error", e);
      }
    }

    if (!order && externalReference) {
      // Check if this is a billing notification (subscription) instead of an order
      const isBillingRef = externalReference.includes("-") || externalReference.includes("|");
      
      if (isBillingRef) {
        console.log("Webhook: Detected billing notification, forwarding to billing handler...");
        try {
          await convex.mutation(api.billing.handleBillingWebhook, {
            externalReference: externalReference,
            mpPaymentId: String(payment.id),
            amount: payment.transaction_amount,
            mpPreapprovalId: payment.metadata?.preapproval_id || payment.id,
          });
          console.log("Webhook: Billing activation successful!");
          return NextResponse.json({ ok: true });
        } catch (e) {
          console.error("Webhook: Billing activation failed", e);
          return NextResponse.json({ ok: true });
        }
      }

      try {
        // Normal order lookup
        order = await convex.query(api.orders.getOrderById, { orderId: externalReference });
      } catch (e) {
        console.warn("Webhook: external_reference not a Convex id or order lookup failed", { externalReference, e });
      }
    }

    if (!order) {
      // As a last resort try to find order by payment id (maybe it was linked earlier)
      try {
        order = await convex.query(api.orders.getOrderByPaymentId, { mercadoPagoPaymentId: String(payment.id) });
      } catch (e) {
        console.error("Webhook: fallback order lookup failed", e);
      }
    }

    if (!order) {
      console.log("Webhook: order not found after fetching payment details", payment.id);
      return NextResponse.json({ ok: true });
    }

    // Link payment id to order (idempotent)
    try {
      await convex.mutation(api.orders.linkPaymentId, { orderId: order._id, mercadoPagoPaymentId: String(payment.id) });
    } catch (e) {
      console.error("Webhook: linkPaymentId failed", e);
    }

    // Derive a normalized payment method to store in the order
    let paymentMethod: any = undefined;
    const pmId = payment.payment_method_id ?? payment.payment_method?.id;
    const pmType = payment.payment_type_id ?? payment.payment_type;
    if (pmId === "pix" || pmType === "pix") paymentMethod = "pix";
    else if (pmType === "credit_card" || pmId === "credit_card") paymentMethod = "cartao_credito";
    else if (pmType === "debit_card" || pmId === "debit_card") paymentMethod = "cartao_debito";

    // Update the Convex mutation that handles status + optional paymentMethod
    try {
      await convex.mutation(api.payments.handleWebhook, {
        mercadoPagoPaymentId: String(payment.id),
        status: String(payment.status),
        paymentMethod,
      });
    } catch (e) {
      console.error("Webhook: handleWebhook mutation failed", e);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

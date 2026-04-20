import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud");

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    // If secret is configured and signature exists, try to verify HMAC(body)
    if (secret && signature) {
      try {
        const v1 = signature.split(",").find((s) => s.startsWith("v1="))?.split("=")[1] ?? signature;
        const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
        if (expected !== v1) {
          console.error("Webhook: invalid signature", { expected, v1, signature });
          return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
        }
      } catch (e) {
        console.error("Webhook: signature verification failed", e);
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }
    } else {
      console.warn("Webhook: MERCADO_PAGO_WEBHOOK_SECRET or signature missing — skipping verification");
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
    if (truck?.mpAccessToken) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${truck.mpAccessToken}` },
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
      console.warn("Webhook: no truck mpAccessToken available; cannot fetch payment details");
    }

    if (!payment) {
      console.log("Webhook: no payment details available, ignoring");
      return NextResponse.json({ ok: true });
    }

    // Determine order id from payment.external_reference (preference external_reference)
    const externalReference = payment.external_reference ?? payment.preference_id ?? null;
    if (!order && externalReference) {
      try {
        // external_reference should contain the orderId we used when creating the preference
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

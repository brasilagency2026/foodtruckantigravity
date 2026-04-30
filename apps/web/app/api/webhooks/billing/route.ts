import { NextRequest, NextResponse } from "next/server";
import { api } from "../../../../convex/_generated/api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud");

    const body = await req.text();
    let data: any;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error("Billing Webhook: invalid JSON body", e);
      return NextResponse.json({ ok: true });
    }

    const paymentId = data?.data?.id ?? data?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const isLive = data?.live_mode !== false; // If explicitly false, it's sandbox
    console.log(`Billing Webhook: Received ${data.type || "unknown"} notification. live_mode: ${isLive}`);

    const accessToken = isLive 
      ? process.env.MERCADO_PAGO_ACCESS_TOKEN 
      : (process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN);

    if (!accessToken) {
      console.error(`Billing Webhook: ERROR - MERCADO_PAGO_ACCESS_TOKEN${!isLive ? '_TEST' : ''} is missing.`);
      return NextResponse.json({ ok: true });
    }

    let mpPreapprovalId = null;
    let paymentStatus = null;
    let externalReference = null;
    let paymentAmount = null;

    if (data.type === "payment" || data?.topic === "payment" || data?.action?.includes("payment")) {
      console.log(`Billing Webhook: Fetching payment ${paymentId}...`);
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (mpRes.ok) {
        const payment = await mpRes.json();
        paymentStatus = payment.status;
        externalReference = payment.external_reference;
        paymentAmount = payment.transaction_amount;
        mpPreapprovalId = payment.metadata?.preapproval_id || payment.order?.id; 
        console.log(`Billing Webhook: Payment details - Status: ${paymentStatus}, Ref: ${externalReference}`);
      } else {
        console.error(`Billing Webhook: Failed to fetch payment ${paymentId}. Status: ${mpRes.status}`);
      }
    } else if (data.type === "subscription_preapproval" || data.type === "subscription_preapproval_plan") {
      console.log(`Billing Webhook: Fetching preapproval ${paymentId}...`);
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (mpRes.ok) {
        const preapproval = await mpRes.json();
        paymentStatus = preapproval.status;
        externalReference = preapproval.external_reference;
        paymentAmount = preapproval.auto_recurring?.transaction_amount;
        mpPreapprovalId = preapproval.id;
        console.log(`Billing Webhook: Preapproval details - Status: ${paymentStatus}, Ref: ${externalReference}`);
      } else {
        console.error(`Billing Webhook: Failed to fetch preapproval ${paymentId}. Status: ${mpRes.status}`);
      }
    }

    if (paymentStatus === "approved" || paymentStatus === "authorized") {
      if (externalReference) {
        console.log(`Billing Webhook: Triggering Convex mutation for ${externalReference}`);
        await convex.mutation(api.billing.handleBillingWebhook, {
          externalReference: externalReference,
          mpPaymentId: String(paymentId),
          amount: paymentAmount,
          mpPreapprovalId: mpPreapprovalId ? String(mpPreapprovalId) : undefined,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Billing webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

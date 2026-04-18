import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-signature") ?? "";

    // Vérifier la signature Mercado Pago
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET!;
    const ts = signature.split(",").find((s) => s.startsWith("ts="))?.split("=")[1];
    const v1 = signature.split(",").find((s) => s.startsWith("v1="))?.split("=")[1];

    if (ts && v1) {
      const manifest = `id:${req.nextUrl.searchParams.get("data.id")};request-id:${req.headers.get("x-request-id")};ts:${ts};`;
      const expected = crypto
        .createHmac("sha256", secret)
        .update(manifest)
        .digest("hex");

      if (expected !== v1) {
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
      }
    }

    const data = JSON.parse(body);

    // Só processar notificações de pagamento
    if (data.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = data.data?.id;
    if (!paymentId) return NextResponse.json({ ok: true });

    // Look up the order to find which truck (and its MP token)
    // The payment external_reference is the orderId
    const order = await convex.query(api.orders.getOrderByPaymentId, {
      mercadoPagoPaymentId: String(paymentId),
    });

    if (!order) {
      console.error("Webhook: order not found for payment", paymentId);
      return NextResponse.json({ ok: true });
    }

    // Get the truck's access token
    const truck = await convex.query(api.foodTrucks.getTruckById, {
      truckId: order.truckId,
    });

    if (!truck?.mpAccessToken) {
      console.error("Webhook: truck has no MP token", order.truckId);
      return NextResponse.json({ ok: true });
    }

    // Buscar detalhes do pagamento no Mercado Pago using the truck's token
    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${truck.mpAccessToken}`,
        },
      }
    );

    const payment = await mpResponse.json();

    // Atualizar no Convex
    await convex.mutation(api.payments.handleWebhook, {
      mercadoPagoPaymentId: String(payment.id),
      status: payment.status,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Mercado Pago redirects here after the seller authorizes
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const truckId = req.nextUrl.searchParams.get("state"); // truckId from state param

  if (!code || !truckId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${truckId ?? ""}?mp=error&reason=missing_params`
    );
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/callback`;

    // Exchange authorization code for access token
    const tokenRes = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.MERCADO_PAGO_APP_ID!,
        client_secret: process.env.MERCADO_PAGO_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("MP OAuth token exchange failed:", tokenRes.status, err);
      const detail = encodeURIComponent(err.slice(0, 200));
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${truckId}?mp=error&reason=token_exchange&status=${tokenRes.status}&detail=${detail}`
      );
    }

    const tokenData = await tokenRes.json();
    // tokenData: { access_token, token_type, expires_in, scope, user_id, refresh_token, ... }

    const expiresAt = Date.now() + tokenData.expires_in * 1000;

    // Save tokens in Convex
    await convex.mutation(api.foodTrucks.saveMercadoPagoTokens, {
      truckId: truckId as Id<"foodTrucks">,
      mpAccessToken: tokenData.access_token,
      mpRefreshToken: tokenData.refresh_token,
      mpUserId: String(tokenData.user_id),
      mpExpiresAt: expiresAt,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${truckId}?mp=success`
    );
  } catch (error) {
    console.error("MP OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${truckId}?mp=error&reason=internal`
    );
  }
}

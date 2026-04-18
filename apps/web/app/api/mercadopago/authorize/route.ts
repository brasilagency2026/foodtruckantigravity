import { NextRequest, NextResponse } from "next/server";

// Redirect the truck owner to Mercado Pago OAuth authorization page
export async function GET(req: NextRequest) {
  const truckId = req.nextUrl.searchParams.get("truckId");
  if (!truckId) {
    return NextResponse.json({ error: "truckId obrigatório" }, { status: 400 });
  }

  const appId = process.env.MERCADO_PAGO_APP_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/callback`;

  const authUrl = new URL("https://auth.mercadopago.com.br/authorization");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("platform_id", "mp");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", truckId); // pass truckId as state for the callback

  return NextResponse.redirect(authUrl.toString());
}

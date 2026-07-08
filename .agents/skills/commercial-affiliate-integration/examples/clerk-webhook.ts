import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks"; // ou svix pour la validation de signatures

// Endpoint pour recevoir les événements Clerk en temps réel
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Clerk webhook secret is not configured." }, { status: 500 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries()) as Record<string, string>;

  let event: any;
  try {
    const clerkWebhook = new Webhook(secret);
    event = clerkWebhook.verify(payload, headers);
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const eventType = event?.type;
  const userData = event?.data;
  
  if (eventType === "user.created" || eventType === "user.updated") {
    // Récupérer l'adresse email principale du nouvel utilisateur inscrit
    const emailAddresses = userData.email_addresses?.map((e: any) => e.email_address?.toLowerCase()) || [];
    const primaryEmail = emailAddresses[0];

    if (primaryEmail) {
      const { ConvexHttpClient } = await import("convex/browser");
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");
      
      // Déclencher une mutation Convex pour notifier qu'un utilisateur a été créé.
      // Le backend Convex pourra alors vérifier si cette adresse correspond à un voucher
      // commercial déjà généré par l'administrateur, afin de lui envoyer les accès finaux.
      await convex.mutation("admin:sendVoucherDashboardReadyEmail", {
        partnerEmail: primaryEmail,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

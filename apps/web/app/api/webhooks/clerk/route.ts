import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { api } from "../../../../convex/_generated/api";

type ClerkUserWebhookEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  object: "event";
  data: {
    email_addresses?: Array<{ id?: string; email_address?: string }>;
    primary_email_address_id?: string;
  };
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function withWebhookCORS(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Clerk-Signature, Clerk-Webhook-Signature, svix-id, svix-timestamp, svix-signature')
  return res
}

export async function OPTIONS(_req: NextRequest) {
  return withWebhookCORS(NextResponse.json({ ok: true }, { status: 200 }))
}

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Clerk webhook secret is not configured.");
    return NextResponse.json({ error: "Clerk webhook secret is not configured." }, { status: 500 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries()) as Record<string, string>;

  let event: ClerkUserWebhookEvent;
  try {
    const clerkWebhook = new Webhook(secret);
    event = clerkWebhook.verify(payload, headers) as ClerkUserWebhookEvent;
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const eventType = event?.type;
  const userData = event?.data;

  if (!userData) {
    console.log("Clerk webhook received no user data; skipping.");
    return NextResponse.json({ ok: true });
  }

  const emailAddresses: string[] = [];
  if (Array.isArray(userData.email_addresses)) {
    for (const email of userData.email_addresses) {
      if (email?.email_address) {
        emailAddresses.push(String(email.email_address).toLowerCase());
      }
    }
  }

  if (!emailAddresses.length && typeof userData.primary_email_address_id === "string") {
    const primaryEmail = userData.email_addresses?.find((e) => e?.id === userData.primary_email_address_id);
    if (primaryEmail?.email_address) {
      emailAddresses.push(String(primaryEmail.email_address).toLowerCase());
    }
  }

  const partnerEmail = emailAddresses[0];
  if (!partnerEmail) {
    console.log("Clerk webhook received user event without an email, skipping.");
    return NextResponse.json({ ok: true });
  }

  if (eventType === "user.created" || eventType === "user.updated") {
    console.log(`Clerk webhook event ${eventType} for partner email ${partnerEmail}`);
    try {
      const { ConvexHttpClient } = await import("convex/browser");
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud");
      await convex.mutation(api.admin.sendVoucherDashboardReadyEmail, {
        partnerEmail,
      });
    } catch (error) {
      console.error("Clerk webhook processing failed:", error);
      return NextResponse.json({ error: "Convex mutation failed." }, { status: 500 });
    }
  } else {
    console.log(`Clerk webhook ignored event type ${eventType}`);
  }

  return NextResponse.json({ ok: true });
}

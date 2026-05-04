import { v } from "convex/values";
import { mutation, action, query } from "./_generated/server";
import { api } from "./_generated/api";

export const registerPushToken = mutation({
  args: {
    token: v.string(),
    clientId: v.optional(v.string()),
    orderId: v.optional(v.id("orders")),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pushTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        clientId: args.clientId ?? existing.clientId,
        orderId: args.orderId ?? existing.orderId,
      });
      return existing._id;
    }

    return await ctx.db.insert("pushTokens", args);
  },
});

/**
 * Action to send a push notification via Firebase (FCM).
 * This requires FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT in Convex Env.
 */
export const sendPushNotification = action({
  args: {
    orderId: v.id("orders"),
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, { orderId, title, body }) => {
    // 1. Get tokens for this order
    const tokens = await ctx.runQuery(api.notifications.getTokensForOrder, { orderId });
    if (tokens.length === 0) return;

    // 2. Send via FCM V1
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountStr) {
      console.error("FIREBASE_SERVICE_ACCOUNT is not set in Convex environment variables.");
      return;
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountStr);
    } catch (e) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON");
      return;
    }

    console.log(`[PUSH] Sending V1 to ${tokens.length} devices: ${title}`);
    
    // 3. Get OAuth2 Token
    let accessToken;
    try {
      accessToken = await getAccessToken(serviceAccount);
    } catch (e) {
      console.error("Failed to get FCM access token", e);
      return;
    }

    const projectId = serviceAccount.project_id;
    const results = await Promise.all(tokens.map(async (t) => {
      try {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message: {
              token: t.token,
              notification: { title, body },
              data: { orderId },
              android: { priority: "high" },
              apns: { payload: { aps: { sound: "default" } } },
            },
          }),
        });
        return await response.json();
      } catch (e) {
        return { success: false, error: String(e) };
      }
    }));

    console.log("[PUSH] Results:", JSON.stringify(results));
  },
});

/**
 * Helper to generate a Google OAuth2 access token from a service account.
 */
async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "");
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const pem = serviceAccount.private_key;
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).replace(/\s/g, "");
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${dataToSign}.${encodedSignature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const resJson = await response.json();
  return resJson.access_token;
}

export const getTokensForOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return [];

    const tokensByOrder = await ctx.db
      .query("pushTokens")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .collect();

    const tokensByClient = await ctx.db
      .query("pushTokens")
      .withIndex("by_client", (q) => q.eq("clientId", order.clientId))
      .collect();

    // Merge and unique
    const all = [...tokensByOrder, ...tokensByClient];
    return Array.from(new Map(all.map(t => [t.token, t])).values());
  },
});

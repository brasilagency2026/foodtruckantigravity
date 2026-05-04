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
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("pushTokens", {
      ...args,
      updatedAt: Date.now(),
    });
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
    // 1. Initial Log
    const logId = await ctx.runMutation(api.notifications.logNotification, {
      orderId,
      title,
      tokensCount: 0,
      results: null,
      sentAt: Date.now(),
      status: "starting"
    });

    // 2. Get tokens for this order
    const tokens = await ctx.runQuery(api.notifications.getTokensForOrder, { orderId });
    await ctx.runMutation(api.notifications.updateLog, { 
      logId, 
      tokensCount: tokens.length,
      status: tokens.length > 0 ? "tokens_found" : "no_tokens"
    });
    
    if (tokens.length === 0) return;

    try {
      // 3. Send via FCM V1
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceAccountStr) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT is missing");
      }

      const serviceAccount = JSON.parse(serviceAccountStr);
      const accessToken = await getAccessToken(serviceAccount);
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
                android: {
                  priority: "high",
                  notification: {
                    sound: "default",
                    clickAction: "TOP_STORY_ACTIVITY",
                    notification_priority: "PRIORITY_MAX",
                    channel_id: "default",
                  },
                },
                apns: {
                  payload: {
                    aps: {
                      sound: "default",
                      contentAvailable: true,
                    },
                  },
                },
              },
            }),
          });
          return await response.json();
        } catch (e) {
          return { error: String(e) };
        }
      }));

      await ctx.runMutation(api.notifications.updateLog, { 
        logId, 
        results,
        status: "completed"
      });
    } catch (e) {
      console.error("[PUSH ERROR]", e);
      await ctx.runMutation(api.notifications.updateLog, { 
        logId, 
        error: String(e),
        status: "failed"
      });
    }
  },
});

export const updateLog = mutation({
  args: {
    logId: v.id("notificationLogs"),
    tokensCount: v.optional(v.number()),
    results: v.optional(v.any()),
    error: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { logId, ...updates }) => {
    await ctx.db.patch(logId, updates);
  },
});

export const logNotification = mutation({
  args: {
    orderId: v.id("orders"),
    title: v.string(),
    tokensCount: v.number(),
    results: v.any(),
    sentAt: v.number(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notificationLogs", args);
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
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
    
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

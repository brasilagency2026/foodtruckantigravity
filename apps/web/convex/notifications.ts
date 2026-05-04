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

    // 2. Send via FCM (Legacy API for simpler implementation)
    const serverKey = process.env.FIREBASE_LEGACY_SERVER_KEY;
    if (!serverKey) {
      console.error("FIREBASE_LEGACY_SERVER_KEY is not set in Convex environment variables.");
      return;
    }

    console.log(`[PUSH] Sending to ${tokens.length} devices: ${title}`);
    
    const results = await Promise.all(tokens.map(t => 
      fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `key=${serverKey}`,
        },
        body: JSON.stringify({
          to: t.token,
          notification: {
            title,
            body,
            sound: "default",
          },
          data: {
            orderId,
            click_action: "FLUTTER_NOTIFICATION_CLICK", // Standard for some plugins
          },
        }),
      }).then(r => r.json())
    ));

    console.log("[PUSH] Results:", JSON.stringify(results));
  },
});

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

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// QUERIES
// ============================================

export const getReviewsByTruck = query({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_truck", (q) => q.eq("truckId", truckId))
      .order("desc")
      .take(50);
  },
});

// ============================================
// MUTATIONS
// ============================================

export const addReview = mutation({
  args: {
    truckId: v.id("foodTrucks"),
    clientId: v.string(),
    clientName: v.string(),
    rating: v.number(),    // 1 a 5
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    // Empêcher les doublons du même client
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_truck", (q) => q.eq("truckId", args.truckId))
      .filter((q) => q.eq(q.field("clientId"), args.clientId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        comment: args.comment,
      });
    } else {
      await ctx.db.insert("reviews", args);
    }

    // Recalculer la note moyenne du truck
    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_truck", (q) => q.eq("truckId", args.truckId))
      .collect();

    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ctx.db.patch(args.truckId, {
      rating: Math.round(avg * 10) / 10,
      totalReviews: allReviews.length,
    });
  },
});

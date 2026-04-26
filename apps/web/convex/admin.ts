import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllFoodTrucks = query({
  args: {},
  handler: async (ctx) => {
    // Return all food trucks for the admin panel
    return await ctx.db.query("foodTrucks").collect();
  },
});

export const updateFoodTruckStatus = mutation({
  args: {
    id: v.id("foodTrucks"),
    approvalStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    isActive: v.optional(v.boolean()),
    subscriptionStatus: v.optional(v.union(v.literal("trial"), v.literal("active"), v.literal("past_due"), v.literal("canceled"))),
    trialEndsAt: v.optional(v.number()),
    nextPaymentAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const updateObj: any = {};
    if (updates.approvalStatus !== undefined) updateObj.approvalStatus = updates.approvalStatus;
    if (updates.isActive !== undefined) updateObj.isActive = updates.isActive;
    if (updates.subscriptionStatus !== undefined) updateObj.subscriptionStatus = updates.subscriptionStatus;
    if (updates.trialEndsAt !== undefined) updateObj.trialEndsAt = updates.trialEndsAt;
    if (updates.nextPaymentAt !== undefined) updateObj.nextPaymentAt = updates.nextPaymentAt;

    await ctx.db.patch(id, updateObj);
  },
});

export const deleteFoodTruck = mutation({
  args: { id: v.id("foodTrucks") },
  handler: async (ctx, args) => {
    // Delete the truck (In a real app, you might want to also delete menus/orders or do a soft delete)
    await ctx.db.delete(args.id);
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

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
    
    // Fetch the truck to get its name and ownerId for the email
    const truck = await ctx.db.get(id);
    if (!truck) throw new Error("Food Truck not found");

    const updateObj: any = {};
    if (updates.approvalStatus !== undefined) updateObj.approvalStatus = updates.approvalStatus;
    if (updates.isActive !== undefined) updateObj.isActive = updates.isActive;
    if (updates.subscriptionStatus !== undefined) updateObj.subscriptionStatus = updates.subscriptionStatus;
    if (updates.trialEndsAt !== undefined) updateObj.trialEndsAt = updates.trialEndsAt;
    if (updates.nextPaymentAt !== undefined) updateObj.nextPaymentAt = updates.nextPaymentAt;

    await ctx.db.patch(id, updateObj);

    // If approval status changed, send email
    if (updates.approvalStatus && updates.approvalStatus !== truck.approvalStatus) {
      await ctx.scheduler.runAfter(0, internal.emails.sendStatusEmail, {
        ownerId: truck.ownerId,
        truckName: truck.name,
        newStatus: updates.approvalStatus,
      });
    }
  },
});

export const deleteFoodTruck = mutation({
  args: { id: v.id("foodTrucks") },
  handler: async (ctx, args) => {
    const truck = await ctx.db.get(args.id);
    
    // Delete the truck (In a real app, you might want to also delete menus/orders or do a soft delete)
    await ctx.db.delete(args.id);

    // Send email notifying deletion
    if (truck) {
      await ctx.scheduler.runAfter(0, internal.emails.sendStatusEmail, {
        ownerId: truck.ownerId,
        truckName: truck.name,
        newStatus: "deleted",
      });
    }
  },
});

export const getAllVouchers = query({
  args: {},
  handler: async (ctx) => {
    const vouchers = await ctx.db.query("vouchers").order("desc").collect();
    
    // For each voucher, calculate the total pending commission and last paid date
    const vouchersWithCommissions = await Promise.all(vouchers.map(async (v) => {
      const allCommissions = await ctx.db
        .query("commissions")
        .withIndex("by_partner", (q) => q.eq("partnerId", v._id))
        .collect();
        
      const pendingAmount = allCommissions
        .filter(c => c.status === "pending")
        .reduce((sum, c) => sum + c.amount, 0);

      const paidCommissions = allCommissions
        .filter(c => c.status === "paid" && c.paidAt)
        .sort((a, b) => (b.paidAt || 0) - (a.paidAt || 0));
        
      const lastPaidAt = paidCommissions.length > 0 ? paidCommissions[0].paidAt : null;
      
      return {
        ...v,
        pendingCommission: pendingAmount,
        lastPaidAt,
      };
    }));
    
    return vouchersWithCommissions;
  },
});

export const payCommissions = mutation({
  args: { partnerId: v.id("vouchers") },
  handler: async (ctx, args) => {
    const pendingCommissions = await ctx.db
      .query("commissions")
      .withIndex("by_partner", (q) => q.eq("partnerId", args.partnerId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const now = Date.now();
    for (const commission of pendingCommissions) {
      await ctx.db.patch(commission._id, {
        status: "paid",
        paidAt: now,
      });
    }
  },
});

export const createVoucher = mutation({
  args: {
    code: v.string(),
    partnerName: v.string(),
    partnerCnpj: v.optional(v.string()),
    partnerPhone: v.optional(v.string()),
    partnerPixKey: v.optional(v.string()),
    isActive: v.boolean(),
    discountPercentage: v.number(),
    commissionPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    // Basic uniqueness check for code
    const existing = await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();

    if (existing) {
      throw new Error("Um voucher com este código já existe.");
    }

    await ctx.db.insert("vouchers", {
      ...args,
      code: args.code.toUpperCase(),
    });
  },
});

export const updateVoucher = mutation({
  args: {
    id: v.id("vouchers"),
    code: v.optional(v.string()),
    partnerName: v.optional(v.string()),
    partnerCnpj: v.optional(v.string()),
    partnerPhone: v.optional(v.string()),
    partnerPixKey: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    discountPercentage: v.optional(v.number()),
    commissionPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }
    
    await ctx.db.patch(id, updates);
  },
});

export const deleteVoucher = mutation({
  args: { id: v.id("vouchers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

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

export const getPartnerDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    // Avoid crashing the client when the user has no email in Convex auth.
    // The commercial dashboard can handle `null`.
    if (!identity?.email) {
      return null;
    }

    const vouchers = await ctx.db
      .query("vouchers")
      .withIndex("by_partner_email", (q) => q.eq("partnerEmail", identity.email))
      .collect();

    if (vouchers.length === 0) {
      return null;
    }

    const voucher = vouchers[0];
    const commissions = await ctx.db
      .query("commissions")
      .withIndex("by_partner", (q) => q.eq("partnerId", voucher._id))
      .collect();

    const truckIds = Array.from(new Set(commissions.map((c) => c.truckId)));
    const trucks = await Promise.all(truckIds.map((id) => ctx.db.get(id)));

    const commissionsWithTruck = commissions.map((commission) => ({
      ...commission,
      truckName:
        trucks.find((truck) => truck?._id === commission.truckId)?.name || "Food Truck",
    }));

    const pendingAmount = commissionsWithTruck
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);

    const paidAmount = commissionsWithTruck
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);

    const referredTrucks = await ctx.db
      .query("foodTrucks")
      .filter((q) => q.eq(q.field("voucherCode"), voucher.code))
      .collect();

    return {
      voucher,
      commissions: commissionsWithTruck,
      pendingAmount,
      paidAmount,
      referredTrucks: referredTrucks.map((truck) => ({
        _id: truck._id,
        name: truck.name,
        phone: truck.phone,
        createdAt: truck._creationTime,
        subscriptionStatus: truck.subscriptionStatus || "trial",
        isActive: truck.isActive,
        trialEndsAt: truck.trialEndsAt,
      })),
    };
  },
});

export const getVoucherByPartnerEmail = query({
  args: {
    partnerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vouchers")
      .withIndex("by_partner_email", (q) => q.eq("partnerEmail", args.partnerEmail))
      .first();
  },
});

export const sendVoucherDashboardReadyEmail = mutation({
  args: {
    partnerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const voucher = await ctx.db
      .query("vouchers")
      .withIndex("by_partner_email", (q) => q.eq("partnerEmail", args.partnerEmail))
      .first();

    if (!voucher || voucher.dashboardEmailSent) {
      return;
    }

    await ctx.db.patch(voucher._id, {
      dashboardEmailSent: true,
    });

    await ctx.scheduler.runAfter(0, internal.emails.sendAffiliateDashboardReadyEmail, {
      partnerEmail: voucher.partnerEmail,
      partnerName: voucher.partnerName,
      code: voucher.code,
      partnerPhone: voucher.partnerPhone,
      partnerPixKey: voucher.partnerPixKey,
      discountPercentage: voucher.discountPercentage,
      commissionPercentage: voucher.commissionPercentage,
    });
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
    partnerEmail: v.optional(v.string()),
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

    const insertData = {
      ...args,
      code: args.code.toUpperCase(),
      dashboardEmailSent: false,
    };

    const newVoucher = await ctx.db.insert("vouchers", insertData);

    // Send onboarding email to partner if email provided
    if (args.partnerEmail) {
      await ctx.scheduler.runAfter(0, internal.emails.sendAffiliateOnboardingEmail, {
        partnerEmail: args.partnerEmail,
        partnerName: args.partnerName,
        code: insertData.code,
        partnerPhone: args.partnerPhone,
        partnerPixKey: args.partnerPixKey,
        discountPercentage: args.discountPercentage,
        commissionPercentage: args.commissionPercentage,
      });
    }

    return newVoucher;
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

export const createPendingFoodTruck = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    voucherCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.email !== "glwebagency2@gmail.com") {
      throw new Error("Não autorizado. Apenas o superadmin pode criar food trucks.");
    }

    // Generate random slug
    const baseSlug = args.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check slug uniqueness
    const existing = await ctx.db
      .query("foodTrucks")
      .withIndex("by_slug", (q) => q.eq("slug", baseSlug))
      .filter((q) =>
        q.and(
          q.eq(q.field("state"), "sp"),
          q.eq(q.field("city"), "sao-paulo")
        )
      )
      .first();

    const finalSlug = existing
      ? `${baseSlug}-${Date.now().toString(36)}`
      : baseSlug;

    // Generate transfer token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const truckId = await ctx.db.insert("foodTrucks", {
      name: args.name,
      description: "Página em construção...",
      cuisine: "Variada",
      latitude: -23.5505,
      longitude: -46.6333,
      address: "A definir",
      coverPhotoUrl: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800",
      phone: args.phone,
      slug: finalSlug,
      state: "sp",
      city: "sao-paulo",
      cityDisplay: "São Paulo",
      stateDisplay: "SP",
      openingHours: {},
      isOpen: false,
      ownerId: `admin_pending_${Date.now()}`,
      approvalStatus: "approved",
      isActive: true,
      trialEndsAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      subscriptionStatus: "trial",
      voucherCode: args.voucherCode || undefined,
      transferToken: token,
    });

    return { truckId, transferToken: token };
  },
});

export const generateTransferToken = mutation({
  args: {
    truckId: v.id("foodTrucks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.email !== "glwebagency2@gmail.com") {
      throw new Error("Não autorizado");
    }

    const truck = await ctx.db.get(args.truckId);
    if (!truck) {
      throw new Error("Food Truck não encontrado.");
    }

    if (!truck.ownerId.startsWith("admin_pending_")) {
      throw new Error("Este Food Truck já foi reivindicado por um proprietário.");
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await ctx.db.patch(args.truckId, {
      transferToken: token,
    });

    return token;
  },
});

export const getTruckByTransferToken = query({
  args: { transferToken: v.string() },
  handler: async (ctx, args) => {
    if (!args.transferToken) return null;
    const truck = await ctx.db
      .query("foodTrucks")
      .withIndex("by_transfer_token", (q) => q.eq("transferToken", args.transferToken))
      .first();

    if (!truck) return null;

    // Return only non-sensitive data
    return {
      _id: truck._id,
      name: truck.name,
      phone: truck.phone,
    };
  },
});

export const claimFoodTruck = mutation({
  args: {
    transferToken: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Você precisa estar conectado para reivindicar um Food Truck.");
    }

    const truck = await ctx.db
      .query("foodTrucks")
      .withIndex("by_transfer_token", (q) => q.eq("transferToken", args.transferToken))
      .first();

    if (!truck) {
      throw new Error("Link de transferência inválido ou expirado.");
    }

    // Set new owner, clear token, and activate trial
    await ctx.db.patch(truck._id, {
      ownerId: identity.subject,
      transferToken: undefined, // Consume token
    });

    return truck._id;
  },
});

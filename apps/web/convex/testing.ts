import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const resetSubscription = mutation({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    await ctx.db.patch(truckId, {
      subscriptionStatus: "inactive",
      isActive: false,
      nextPaymentAt: undefined,
    });
  },
});

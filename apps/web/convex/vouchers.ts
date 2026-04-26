import { v } from "convex/values";
import { query } from "./_generated/server";

export const getVoucherByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const codeUpper = args.code.trim().toUpperCase();
    if (!codeUpper) return null;
    
    const voucher = await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("code", codeUpper))
      .first();

    if (!voucher || !voucher.isActive) {
      return null;
    }

    return {
      discountPercentage: voucher.discountPercentage,
    };
  },
});

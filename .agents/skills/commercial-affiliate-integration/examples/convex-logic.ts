import { v } from "convex/values";
import { query, mutation, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// ============================================
// 1. REQUÊTE POUR RÉCUPÉRER LE DASHBOARD COMMERCIAL
// ============================================

export const getPartnerDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      return null;
    }

    // Récupérer le voucher associé à l'adresse e-mail du commercial connecté
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

    const pendingAmount = commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0);

    const paidAmount = commissions
      .filter((c) => c.status === "paid")
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      voucher,
      commissions,
      pendingAmount,
      paidAmount,
    };
  },
});

// ============================================
// 2. REQUÊTE POUR VALIDER UN CODE VOUCHER
// ============================================

export const getVoucherByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
  },
});

// ============================================
// 3. ACTION POUR ENVOYER UN EMAIL D'INVITATION COMMERCIAL
// ============================================

export const sendAffiliateOnboardingEmail = internalAction({
  args: {
    partnerEmail: v.string(),
    partnerName: v.string(),
    code: v.string(),
    discountPercentage: v.number(),
    commissionPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.yourdomain.com";

    // Générer les liens pointant vers les formulaires commerciaux spécifiques
    const signInLink = `${baseUrl.replace(/\/$/,"")}/comercial/sign-in?email=${encodeURIComponent(args.partnerEmail)}`;
    const signUpLink = `${baseUrl.replace(/\/$/,"")}/comercial/sign-up?email=${encodeURIComponent(args.partnerEmail)}`;

    console.log(`Email links generated for commercial registration :
      SignUp : ${signUpLink}
      SignIn : ${signInLink}
    `);

    // Intégrer l'envoi d'e-mail avec Resend ou votre fournisseur d'emails
  },
});

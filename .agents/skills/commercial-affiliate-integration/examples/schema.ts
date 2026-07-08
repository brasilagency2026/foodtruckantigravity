import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table des clients ou entités principales (ici, Food Trucks)
  foodTrucks: defineTable({
    name: v.string(),
    ownerId: v.string(),
    isActive: v.optional(v.boolean()),
    subscriptionStatus: v.optional(v.union(v.literal("trial"), v.literal("active"), v.literal("past_due"), v.literal("canceled"))),
    
    // Code de parrainage du commercial (si parrainé)
    voucherCode: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"]),

  // Table des Vouchers (partenaires commerciaux)
  vouchers: defineTable({
    code: v.string(),                  // e.g. "GERALD"
    partnerName: v.string(),           // Nom du commercial
    partnerEmail: v.optional(v.string()), // Email unique du commercial pour le dashboard
    partnerPhone: v.optional(v.string()),
    partnerPixKey: v.optional(v.string()), // Informations financières
    isActive: v.boolean(),
    discountPercentage: v.number(),    // Pourcentage de remise client (ex: 10)
    commissionPercentage: v.number(),  // Pourcentage de commission commerciale (ex: 50)
    dashboardEmailSent: v.optional(v.boolean()),
  })
    .index("by_code", ["code"])
    .index("by_partner_email", ["partnerEmail"]),

  // Table des Commissions générées
  commissions: defineTable({
    partnerId: v.id("vouchers"),
    truckId: v.id("foodTrucks"),
    amount: v.number(),                // Gain généré
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
    paymentDate: v.number(),           // Horodatage du paiement client
    paymentType: v.union(v.literal("monthly"), v.literal("annual")),
    paidAt: v.optional(v.number()),    // Date du versement au commercial par l'admin
  })
    .index("by_partner", ["partnerId"])
    .index("by_status", ["status"]),
});

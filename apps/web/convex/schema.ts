import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  foodTrucks: defineTable({
    name: v.string(),
    description: v.string(),
    cuisine: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    isOpen: v.boolean(),
    ownerId: v.string(), // Keeping as string to avoid breaking changes if they come from external IDs, but Convex Auth uses IDs.
    coverPhotoUrl: v.string(),
    rating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    phone: v.string(),
    slug: v.optional(v.string()),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    cityDisplay: v.optional(v.string()),
    stateDisplay: v.optional(v.string()),
    openingHours: v.object({
      monday: v.optional(v.object({ open: v.string(), close: v.string() })),
      tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      wednesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
      friday: v.optional(v.object({ open: v.string(), close: v.string() })),
      saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
      sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
    }),
    // Mercado Pago OAuth
    mpAccessToken: v.optional(v.string()),
    mpRefreshToken: v.optional(v.string()),
    mpUserId: v.optional(v.string()),
    mpExpiresAt: v.optional(v.number()),
    // Admin & Subscription Fields
    approvalStatus: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    isActive: v.optional(v.boolean()), // For pausing accounts
    trialEndsAt: v.optional(v.number()), // Timestamp for end of free trial
    nextPaymentAt: v.optional(v.number()), // Timestamp for next subscription payment
    subscriptionStatus: v.optional(v.union(v.literal("trial"), v.literal("active"), v.literal("past_due"), v.literal("canceled"))),
    subscriptionPlan: v.optional(v.union(v.literal("monthly"), v.literal("annual"))),
  })
    .index("by_owner", ["ownerId"])
    .index("by_open", ["isOpen"])
    .index("by_slug", ["slug"])
    .index("by_city", ["state", "city"])
    .index("by_approval", ["approvalStatus"]),

  menuItems: defineTable({
    truckId: v.id("foodTrucks"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    photoUrl: v.string(),
    category: v.string(),
    available: v.boolean(),
    preparationTime: v.optional(v.number()),
    allergens: v.optional(v.array(v.string())),
    sku: v.optional(v.string()),
    variations: v.optional(v.array(v.object({
      name: v.string(),
      price: v.number(),
    }))),
  })
    .index("by_truck", ["truckId"])
    .index("by_truck_category", ["truckId", "category"]),

  orders: defineTable({
    truckId: v.id("foodTrucks"),
    clientId: v.string(),
    clientName: v.string(),
    clientPhone: v.string(),
    items: v.array(v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      observations: v.optional(v.string()),
      sku: v.optional(v.string()),
      variationName: v.optional(v.string()),
    })),
    totalPrice: v.number(),
    status: v.union(
      v.literal("recebido"),
      v.literal("preparando"),
      v.literal("pronto"),
      v.literal("entregue"),
      v.literal("cancelado")
    ),
    paymentStatus: v.union(
      v.literal("pendente"),
      v.literal("aprovado"),
      v.literal("recusado"),
      v.literal("reembolsado")
    ),
    paymentMethod: v.union(
      v.literal("pix"),
      v.literal("cartao_credito"),
      v.literal("cartao_debito"),
      v.literal("dinheiro")
    ),
    manual: v.optional(v.boolean()),
    mercadoPagoPaymentId: v.optional(v.string()),
    estimatedTime: v.optional(v.number()),
  })
    .index("by_truck", ["truckId"])
    .index("by_client", ["clientId"])
    .index("by_truck_status", ["truckId", "status"])
    .index("by_payment", ["mercadoPagoPaymentId"]),

  reviews: defineTable({
    truckId: v.id("foodTrucks"),
    clientId: v.string(),
    clientName: v.string(),
    rating: v.number(),
    comment: v.string(),
  }).index("by_truck", ["truckId"]),

  // Commerciaux / Partenaires
  vouchers: defineTable({
    code: v.string(), // e.g. "CARLOS10"
    partnerName: v.string(), // e.g. "Carlos Silva"
    partnerCnpj: v.optional(v.string()), // Optional, the partner's CNPJ
    partnerPhone: v.optional(v.string()),
    isActive: v.boolean(),
    discountPercentage: v.number(), // Always 10 for now
    commissionPercentage: v.number(), // Always 50 for now
  }).index("by_code", ["code"]),

  commissions: defineTable({
    partnerId: v.id("vouchers"),
    truckId: v.id("foodTrucks"),
    amount: v.number(), // Commission amount in BRL
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
    paymentDate: v.number(), // Date the customer paid
    paymentType: v.union(v.literal("monthly"), v.literal("annual")), // To track if it was a monthly recurring or annual payment
    mercadopagoPaymentId: v.optional(v.string()), // To cross-reference with MP
    paidAt: v.optional(v.number()), // Date and time when the admin paid the commercial
  })
    .index("by_partner", ["partnerId"])
    .index("by_status", ["status"]),
});


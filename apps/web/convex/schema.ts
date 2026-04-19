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
  })
    .index("by_owner", ["ownerId"])
    .index("by_open", ["isOpen"])
    .index("by_slug", ["slug"])
    .index("by_city", ["state", "city"]),

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
});


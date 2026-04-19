import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// QUERIES
// ============================================

// Busca por slug SEO: /menu/sp/sao-paulo/smash-burg-sp
export const getTruckBySlug = query({
  args: {
    state: v.string(),
    city: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, { state, city, slug }) => {
    return await ctx.db
      .query("foodTrucks")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) =>
        q.and(
          q.eq(q.field("state"), state),
          q.eq(q.field("city"), city)
        )
      )
      .first();
  },
});

// Todos os trucks de uma cidade (para sitemap e listagens)
export const getTrucksByCity = query({
  args: { state: v.string(), city: v.string() },
  handler: async (ctx, { state, city }) => {
    return await ctx.db
      .query("foodTrucks")
      .withIndex("by_city", (q) => q.eq("state", state).eq("city", city))
      .collect();
  },
});

// Trucks próximos por geolocalização
export const getNearbyTrucks = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.number(),
  },
  handler: async (ctx, { latitude, longitude, radiusKm }) => {
    const trucks = await ctx.db.query("foodTrucks").collect();
    return trucks.filter((truck) => {
      const R = 6371;
      const dLat = ((truck.latitude - latitude) * Math.PI) / 180;
      const dLon = ((truck.longitude - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((truck.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return distance <= radiusKm;
    });
  },
});

// Um truck por ID (dashboard interno)
export const getTruckById = query({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    return await ctx.db.get(truckId);
  },
});

// Trucks do proprietário logado
export const getMyTrucks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    return await ctx.db
      .query("foodTrucks")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .collect();
  },
});


// Todos os trucks (para sitemap.xml)
export const getAllTrucks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("foodTrucks")
      .collect();
  },
});

// ============================================
// MUTATIONS
// ============================================

export const createTruck = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    cuisine: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
    coverPhotoUrl: v.string(),
    phone: v.string(),
    slug: v.string(),
    state: v.string(),
    city: v.string(),
    cityDisplay: v.string(),
    stateDisplay: v.string(),
    openingHours: v.object({
      monday: v.optional(v.object({ open: v.string(), close: v.string() })),
      tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      wednesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
      friday: v.optional(v.object({ open: v.string(), close: v.string() })),
      saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
      sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verificar se slug já existe nessa cidade
    const existing = await ctx.db
      .query("foodTrucks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) =>
        q.and(
          q.eq(q.field("state"), args.state),
          q.eq(q.field("city"), args.city)
        )
      )
      .first();

    // Se slug já existe, adicionar sufixo numérico
    const finalSlug = existing
      ? `${args.slug}-${Date.now().toString(36)}`
      : args.slug;

    return await ctx.db.insert("foodTrucks", {
      ...args,
      ownerId: identity.subject,
      slug: finalSlug,
      isOpen: false,
    });
  },
});

export const updateTruck = mutation({
  args: {
    truckId: v.id("foodTrucks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    cuisine: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    coverPhotoUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    cityDisplay: v.optional(v.string()),
    stateDisplay: v.optional(v.string()),
    openingHours: v.optional(v.object({
      monday: v.optional(v.object({ open: v.string(), close: v.string() })),
      tuesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      wednesday: v.optional(v.object({ open: v.string(), close: v.string() })),
      thursday: v.optional(v.object({ open: v.string(), close: v.string() })),
      friday: v.optional(v.object({ open: v.string(), close: v.string() })),
      saturday: v.optional(v.object({ open: v.string(), close: v.string() })),
      sunday: v.optional(v.object({ open: v.string(), close: v.string() })),
    })),
  },
  handler: async (ctx, { truckId, ...fields }) => {
    await ctx.db.patch(truckId, fields);
  },
});

export const toggleOpen = mutation({
  args: { truckId: v.id("foodTrucks"), isOpen: v.boolean() },
  handler: async (ctx, { truckId, isOpen }) => {
    await ctx.db.patch(truckId, { isOpen });
  },
});

export const updateLocation = mutation({
  args: {
    truckId: v.id("foodTrucks"),
    latitude: v.number(),
    longitude: v.number(),
    address: v.string(),
  },
  handler: async (ctx, { truckId, latitude, longitude, address }) => {
    await ctx.db.patch(truckId, { latitude, longitude, address });
  },
});

export const saveMercadoPagoTokens = mutation({
  args: {
    truckId: v.id("foodTrucks"),
    mpAccessToken: v.string(),
    mpRefreshToken: v.string(),
    mpUserId: v.string(),
    mpExpiresAt: v.number(),
  },
  handler: async (ctx, { truckId, mpAccessToken, mpRefreshToken, mpUserId, mpExpiresAt }) => {
    await ctx.db.patch(truckId, { mpAccessToken, mpRefreshToken, mpUserId, mpExpiresAt });
  },
});

export const disconnectMercadoPago = mutation({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    await ctx.db.patch(truckId, {
      mpAccessToken: undefined,
      mpRefreshToken: undefined,
      mpUserId: undefined,
      mpExpiresAt: undefined,
    });
  },
});

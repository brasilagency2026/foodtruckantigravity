import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// QUERIES
// ============================================

// Cardápio complet d'un truck — page publique QR Code
export const getMenuByTruck = query({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_truck", (q) => q.eq("truckId", truckId))
      .filter((q) => q.eq(q.field("available"), true))
      .collect();

    // Grouper par catégorie
    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }

    return grouped;
  },
});

// Tous les items pour le panneau admin (y compris indisponibles)
export const getAllMenuItemsByTruck = query({
  args: { truckId: v.id("foodTrucks") },
  handler: async (ctx, { truckId }) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_truck", (q) => q.eq("truckId", truckId))
      .collect();
  },
});

// Un item par ID
export const getMenuItemById = query({
  args: { itemId: v.id("menuItems") },
  handler: async (ctx, { itemId }) => {
    return await ctx.db.get(itemId);
  },
});

// ============================================
// MUTATIONS
// ============================================

// Ajouter un item au cardápio
export const createMenuItem = mutation({
  args: {
    truckId: v.id("foodTrucks"),
    name: v.string(),
    description: v.string(),
    price: v.number(),         // em centavos
    photoUrl: v.string(),      // Cloudflare R2
    category: v.string(),
    sku: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", {
      ...args,
      available: true,
    });
  },
});

// Modifier un item
export const updateMenuItem = mutation({
  args: {
    itemId: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    photoUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    sku: v.optional(v.string()),
  },
  handler: async (ctx, { itemId, ...fields }) => {
    await ctx.db.patch(itemId, fields);
  },
});

// Toggle disponible / indisponible
export const toggleAvailable = mutation({
  args: { itemId: v.id("menuItems"), available: v.boolean() },
  handler: async (ctx, { itemId, available }) => {
    await ctx.db.patch(itemId, { available });
  },
});

// Supprimer un item
export const deleteMenuItem = mutation({
  args: { itemId: v.id("menuItems") },
  handler: async (ctx, { itemId }) => {
    await ctx.db.delete(itemId);
  },
});

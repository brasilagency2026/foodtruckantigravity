import { useState, useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, SafeAreaView
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function MenuScreen() {
  const { truckId } = useLocalSearchParams<{ truckId: string }>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const truck = useQuery(api.foodTrucks.getTruckById, {
    truckId: truckId as Id<"foodTrucks">,
  });

  // Fetch flat items and group locally with sanitized keys to avoid
  // Convex field-name errors coming from non-ASCII category names.
  const items = useQuery(api.menu.getAllMenuItemsByTruck, {
    truckId: truckId as Id<"foodTrucks">,
  }) as any[] | undefined;

  const { menuGrouped, labelMap } = useMemo(() => {
    function sanitizeKey(s: string) {
      if (!s) return "Geral";
      try {
        const normalized = s.normalize("NFD").replace(/\p{M}/gu, "");
        return normalized.replace(/[^\x20-\x7E]/g, "");
      } catch (e) {
        const normalized = s.normalize("NFD").replace(/[\u0000-\u036f]/g, "");
        return normalized.replace(/[^\x20-\x7E]/g, "");
      }
    }
    const grouped: Record<string, any[]> = {};
    const labels: Record<string, string> = {};
    for (const it of items ?? []) {
      const rawCat = it.category ?? "Geral";
      const key = sanitizeKey(rawCat);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(it);
      if (!labels[key]) labels[key] = rawCat;
    }
    return { menuGrouped: grouped, labelMap: labels };
  }, [items]);

  const categories = menuGrouped ? Object.keys(menuGrouped) : [];
  const currentCategory = activeCategory ?? (categories[0] ?? "Todos");
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(item: { _id: string; name: string; price: number }) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function removeFromCart(menuItemId: string) {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function getQty(menuItemId: string) {
    return cart.find((i) => i.menuItemId === menuItemId)?.quantity ?? 0;
  }

  if (!truck || !menuGrouped) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Carregando cardápio...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        {truck.coverPhotoUrl ? (
          <Image source={{ uri: truck.coverPhotoUrl }} style={styles.cover} />
        ) : null}
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.openBadge}>
            {truck.isOpen ? "🟢 Aberto agora" : "🔴 Fechado"}
          </Text>
          <Text style={styles.truckName}>{truck.name}</Text>
          <Text style={styles.truckMeta}>
            {truck.cuisine}
          </Text>
        </View>
      </View>

      {/* Categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, currentCategory === cat && styles.catBtnActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, currentCategory === cat && styles.catTextActive]}>
              {labelMap[cat] ?? cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Itens */}
      <ScrollView style={styles.itemsList} contentContainerStyle={{ paddingBottom: 140 }}>
        {(menuGrouped[currentCategory] ?? []).map((item) => {
          const qty = getQty(item._id);
          return (
            <View key={item._id} style={styles.item}>
              {item.photoUrl && (
                <Image source={{ uri: item.photoUrl }} style={styles.itemPhoto} />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  {qty === 0 ? (
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                      <Text style={styles.addBtnText}>+ Adicionar</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyControl}>
                      <TouchableOpacity onPress={() => removeFromCart(item._id)}>
                        <Text style={styles.qtyBtn}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyNum}>{qty}</Text>
                      <TouchableOpacity onPress={() => addToCart(item)}>
                        <Text style={styles.qtyBtn}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating cart */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartFloat}
          onPress={() =>
            router.push({
              pathname: "/checkout",
              params: {
                truckId,
                items: JSON.stringify(cart),
                total: String(cartTotal),
              },
            })
          }
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartBtnText}>Ver carrinho</Text>
          <Text style={styles.cartTotal}>{formatPrice(cartTotal)}</Text>
        </TouchableOpacity>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D0D0D" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0D0D0D" },
  loadingText: { color: "rgba(255,255,255,0.4)", fontFamily: "System" },
  header: { height: 200, position: "relative" },
  cover: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: {
    position: "absolute", inset: 0,
    backgroundColor: "rgba(13,13,13,0.75)",
  },
  headerContent: { position: "absolute", bottom: 20, left: 20, right: 20 },
  openBadge: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600", marginBottom: 6 },
  truckName: { color: "#FFF", fontSize: 24, fontWeight: "800" },
  truckMeta: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 },
  catScroll: { maxHeight: 56 },
  catContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  catBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 100, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginRight: 8,
  },
  catBtnActive: { backgroundColor: "#FF6B35", borderColor: "#FF6B35" },
  catText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "500" },
  catTextActive: { color: "#FFF" },
  itemsList: { flex: 1, paddingHorizontal: 20 },
  item: {
    backgroundColor: "#1A1A1A", borderRadius: 16,
    marginVertical: 8, flexDirection: "row", overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  itemPhoto: { width: 100, height: 100, resizeMode: "cover" },
  itemInfo: { flex: 1, padding: 14 },
  itemName: { color: "#FFF", fontSize: 15, fontWeight: "600", marginBottom: 4 },
  itemDesc: { color: "rgba(255,255,255,0.4)", fontSize: 12, flex: 1, lineHeight: 18 },
  itemFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  itemPrice: { color: "#FF6B35", fontWeight: "700", fontSize: 15 },
  addBtn: { backgroundColor: "#FF6B35", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  qtyControl: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8, padding: 6,
  },
  qtyBtn: { color: "#FF6B35", fontSize: 18, fontWeight: "700", paddingHorizontal: 4 },
  qtyNum: { color: "#FFF", fontWeight: "600", fontSize: 14, minWidth: 16, textAlign: "center" },
  cartFloat: {
    position: "absolute", bottom: 24, left: 20, right: 20,
    backgroundColor: "#FF6B35", borderRadius: 16,
    padding: 18, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  cartBadge: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 100, paddingHorizontal: 10, paddingVertical: 2,
  },
  cartBadgeText: { color: "#FFF", fontWeight: "700", fontSize: 13 },
  cartBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  cartTotal: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useQuery } from "convex/react";
import { useAuth } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { formatPrice, formatOrderStatus } from "shared/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrdersTab() {
  const { isAuthenticated, userId } = useAuth();
  const insets = useSafeAreaInsets();
  const orders = useQuery(
    api.orders.getOrdersByClient,
    isAuthenticated ? { clientId: userId as string } : "skip"
  );


  const STATUS_COLORS: Record<string, string> = {
    recebido: "#3B82F6",
    preparando: "#F59E0B",
    pronto: "#FF6B35",
    entregue: "#22C55E",
    cancelado: "#EF4444",
  };

  return (
    <View style={[s.page, { paddingTop: insets.top + 16 }]}>
      <Text style={s.title}>Meus pedidos</Text>

      {!isAuthenticated ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>👤</Text>
          <Text style={s.emptyText}>Faça login para ver seus pedidos</Text>
        </View>
      ) : !orders || orders.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>🍔</Text>
          <Text style={s.emptyText}>Nenhum pedido ainda</Text>
          <Text style={s.emptyHint}>Escaneie o QR Code de um food truck para começar</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => router.push(`/order/${item._id}`)}
            >
              <View style={s.cardHeader}>
                <Text style={s.orderNum}>
                  #{item._id.slice(-4).toUpperCase()}
                </Text>
                <View style={[s.statusBadge, { backgroundColor: `${STATUS_COLORS[item.status]}20` }]}>
                  <Text style={[s.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {formatOrderStatus(item.status)}
                  </Text>
                </View>
              </View>

              <View style={s.cardItems}>
                {item.items.slice(0, 3).map((i: any, idx: number) => (
                  <Text key={idx} style={s.itemText} numberOfLines={1}>
                    {i.quantity}x {i.name}
                  </Text>
                ))}
                {item.items.length > 3 && (
                  <Text style={s.moreItems}>+{item.items.length - 3} itens</Text>
                )}
              </View>

              <View style={s.cardFooter}>
                <Text style={s.cardDate}>
                  {new Date(item._creationTime).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={s.cardTotal}>{formatPrice(item.totalPrice)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D0D", paddingHorizontal: 20 },
  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyIcon: { fontSize: 52 },
  emptyText: { color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: "600" },
  emptyHint: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  list: { gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNum: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "600" },
  statusBadge: { borderRadius: 100, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardItems: { gap: 4 },
  itemText: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  moreItems: { color: "rgba(255,255,255,0.25)", fontSize: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  cardDate: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  cardTotal: { color: "#FFF", fontWeight: "800", fontSize: 15 },
});

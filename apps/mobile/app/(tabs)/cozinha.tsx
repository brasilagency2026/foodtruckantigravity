import { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Vibration, Platform, Animated, Alert
} from "react-native";
import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@convex-dev/auth/react";
import { Audio } from "expo-av";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ⚠️ En production, récupérer le truckId depuis le profil du propriétaire
// Pour l'instant, passé en param ou depuis le store local
const TRUCK_ID = process.env.EXPO_PUBLIC_KITCHEN_TRUCK_ID as Id<"foodTrucks">;

export default function CozinhaMobileScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, userId } = useAuth();

  const [activeTab, setActiveTab] = useState<"ativos" | "historico">("ativos");
  const prevOrderCount = useRef<number>(0);
  const flashAnim = useRef(new Animated.Value(0)).current;

  const activeOrders = useQuery(api.orders.getActiveOrdersForTruck, {
    truckId: TRUCK_ID,
  });
  const todayOrders = useQuery(api.orders.getTodayOrdersForTruck, {
    truckId: TRUCK_ID,
  });
  const updateStatus = useMutation(api.orders.updateOrderStatus);
  const toggleOpen = useMutation(api.foodTrucks.toggleOpen);
  const truck = useQuery(api.foodTrucks.getTruckById, { truckId: TRUCK_ID });

  // ⚡ Nouveau pedido — son + vibration + flash
  useEffect(() => {
    if (!activeOrders) return;
    const count = activeOrders.length;

    if (prevOrderCount.current > 0 && count > prevOrderCount.current) {
      triggerNewOrderAlert();
    }
    prevOrderCount.current = count;
  }, [activeOrders?.length]);

  async function triggerNewOrderAlert() {
    // Vibration courte triple
    if (Platform.OS === "android") {
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);
    } else {
      Vibration.vibrate();
    }

    // Son de nouvelle commande
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/new-order.mp3"),
        { shouldPlay: true, volume: 1.0 }
      );
      setTimeout(() => sound.unloadAsync(), 4000);
    } catch {}

    // Flash de l'écran
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }

  async function handleUpdateStatus(
    orderId: Id<"orders">,
    newStatus: "preparando" | "pronto" | "entregue" | "cancelado",
    label: string
  ) {
    try {
      await updateStatus({ orderId, status: newStatus });

      // Feedback haptic
      if (Platform.OS === "android") Vibration.vibrate(60);

      // Son de confirmation
      if (newStatus === "pronto") {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/ready.mp3"),
          { shouldPlay: true, volume: 0.8 }
        );
        setTimeout(() => sound.unloadAsync(), 4000);
      }
    } catch {
      Alert.alert("Erro", `Não foi possível atualizar para "${label}".`);
    }
  }

  const flashColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,107,53,0)", "rgba(255,107,53,0.15)"],
  });

  return (
    <Animated.View style={[s.page, { paddingTop: insets.top + 8, backgroundColor: flashColor as any }]}>

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>👨‍🍳 Cozinha</Text>
          {truck && (
            <Text style={s.truckName}>{truck.name}</Text>
          )}
        </View>

        {/* Toggle aberto/fechado */}
        {truck && (
          <TouchableOpacity
            style={[s.toggleBtn, truck.isOpen ? s.toggleOpen : s.toggleClosed]}
            onPress={() => toggleOpen({ truckId: TRUCK_ID, isOpen: !truck.isOpen })}
          >
            <Text style={s.toggleText}>
              {truck.isOpen ? "🟢 Aberto" : "🔴 Fechado"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats rápidas */}
      <View style={s.statsRow}>
        <View style={s.statPill}>
          <Text style={s.statNum}>{activeOrders?.length ?? 0}</Text>
          <Text style={s.statLabel}>ativos</Text>
        </View>
        <View style={s.statPill}>
          <Text style={s.statNum}>
            {todayOrders?.filter((o) => o.status === "entregue").length ?? 0}
          </Text>
          <Text style={s.statLabel}>entregues hoje</Text>
        </View>
        <View style={s.statPill}>
          <Text style={s.statNum}>
            {formatPrice(
              todayOrders
                ?.filter((o) => o.paymentStatus === "aprovado")
                .reduce((sum, o) => sum + o.totalPrice, 0) ?? 0
            )}
          </Text>
          <Text style={s.statLabel}>hoje</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(["ativos", "historico"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === "ativos" ? `Ativos (${activeOrders?.length ?? 0})` : "Histórico hoje"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de pedidos */}
      {activeTab === "ativos" ? (
        <FlatList
          data={activeOrders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🎉</Text>
              <Text style={s.emptyText}>Nenhum pedido ativo</Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        />
      ) : (
        <FlatList
          data={todayOrders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyText}>Nenhum pedido hoje ainda</Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onUpdateStatus={handleUpdateStatus}
              readonly={item.status === "entregue" || item.status === "cancelado"}
            />
          )}
        />
      )}
    </Animated.View>
  );
}

// ============================================
// ORDER CARD
// ============================================
function OrderCard({
  order,
  onUpdateStatus,
  readonly = false,
}: {
  order: any;
  onUpdateStatus: (id: Id<"orders">, status: any, label: string) => void;
  readonly?: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    recebido: "#3B82F6",
    preparando: "#F59E0B",
    pronto: "#22C55E",
    entregue: "rgba(255,255,255,0.3)",
    cancelado: "#EF4444",
  };

  const elapsed = Math.floor((Date.now() - order._creationTime) / 60000);
  const isUrgent = elapsed > 15 && order.status !== "pronto";

  return (
    <Animated.View style={[
      s.orderCard,
      { transform: [{ scale: scaleAnim }] },
      isUrgent && s.orderCardUrgent,
    ]}>

      {/* Header do card */}
      <View style={s.orderHeader}>
        <View style={s.orderHeaderLeft}>
          <Text style={s.orderNum}>
            #{order._id.slice(-4).toUpperCase()}
          </Text>
          {isUrgent && (
            <View style={s.urgentBadge}>
              <Text style={s.urgentText}>⚠️ {elapsed}min</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[order.status] }]} />
          <Text style={s.orderTime}>
            {new Date(order._creationTime).toLocaleTimeString("pt-BR", {
              hour: "2-digit", minute: "2-digit",
            })}
          </Text>
        </View>
      </View>

      {/* Cliente */}
      <Text style={s.clientName}>👤 {order.clientName}</Text>

      {/* Itens */}
      <View style={s.orderItems}>
        {order.items.map((item: any, i: number) => (
          <View key={i} style={s.orderItemRow}>
            <Text style={s.orderItemQty}>{item.quantity}x</Text>
            <View style={s.orderItemInfo}>
              <Text style={s.orderItemName}>{item.name}</Text>
              {item.observations && (
                <Text style={s.orderItemObs}>⚠️ {item.observations}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={s.orderFooter}>
        <Text style={s.orderTotal}>{formatPrice(order.totalPrice)}</Text>

        {!readonly && (
          <View style={s.orderActions}>
            {order.status === "recebido" && (
              <TouchableOpacity
                style={[s.actionBtn, s.actionBtnPreparing]}
                onPress={() => onUpdateStatus(order._id, "preparando", "Preparando")}
              >
                <Text style={s.actionBtnText}>👨‍🍳 Iniciar</Text>
              </TouchableOpacity>
            )}
            {order.status === "preparando" && (
              <>
                <TouchableOpacity
                  style={[s.actionBtn, s.actionBtnCancel]}
                  onPress={() => onUpdateStatus(order._id, "cancelado", "Cancelado")}
                >
                  <Text style={[s.actionBtnText, { color: "#EF4444" }]}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, s.actionBtnReady]}
                  onPress={() => onUpdateStatus(order._id, "pronto", "Pronto")}
                >
                  <Text style={s.actionBtnText}>🔔 Pronto!</Text>
                </TouchableOpacity>
              </>
            )}
            {order.status === "pronto" && (
              <TouchableOpacity
                style={[s.actionBtn, s.actionBtnDelivered]}
                onPress={() => onUpdateStatus(order._id, "entregue", "Entregue")}
              >
                <Text style={s.actionBtnText}>✓ Entregue</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {readonly && (
          <View style={[s.statusDot, {
            backgroundColor: STATUS_COLORS[order.status],
            width: "auto",
            height: "auto",
            borderRadius: 100,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }]}>
            <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>
              {order.status === "entregue" ? "✓ Entregue" : "✕ Cancelado"}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  title: { color: "#FFF", fontSize: 22, fontWeight: "800" },
  truckName: { color: "#FF6B35", fontSize: 13, fontWeight: "500", marginTop: 2 },
  toggleBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 100,
  },
  toggleOpen: { backgroundColor: "rgba(34,197,94,0.15)" },
  toggleClosed: { backgroundColor: "rgba(239,68,68,0.1)" },
  toggleText: { fontWeight: "700", fontSize: 13 },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statPill: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statNum: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#FF6B35" },
  tabText: { color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#FFF" },
  list: { gap: 12, paddingBottom: 100 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 44 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 15 },
  orderCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },
  orderCardUrgent: {
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.04)",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderNum: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  urgentBadge: {
    backgroundColor: "rgba(239,68,68,0.2)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  urgentText: { color: "#EF4444", fontSize: 11, fontWeight: "700" },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  orderTime: { color: "rgba(255,255,255,0.3)", fontSize: 13 },
  clientName: { color: "rgba(255,255,255,0.6)", fontSize: 14 },
  orderItems: { gap: 8 },
  orderItemRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  orderItemQty: {
    color: "#FF6B35", fontWeight: "700", fontSize: 14,
    width: 28, textAlign: "center",
  },
  orderItemInfo: { flex: 1 },
  orderItemName: { color: "#FFF", fontSize: 14, fontWeight: "500" },
  orderItemObs: { color: "#F59E0B", fontSize: 12, marginTop: 2 },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  orderTotal: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  orderActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, alignItems: "center",
  },
  actionBtnPreparing: { backgroundColor: "rgba(59,130,246,0.2)" },
  actionBtnReady: { backgroundColor: "#FF6B35" },
  actionBtnDelivered: { backgroundColor: "rgba(34,197,94,0.2)" },
  actionBtnCancel: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    paddingHorizontal: 12,
  },
  actionBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
});

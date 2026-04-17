import { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Vibration, Platform, Animated
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STEPS = [
  { key: "recebido",   icon: "✅", label: "Pedido recebido",      desc: "O food truck recebeu seu pedido" },
  { key: "preparando", icon: "👨‍🍳", label: "Preparando",           desc: "Seu pedido está sendo preparado" },
  { key: "pronto",     icon: "🔔", label: "Pronto para retirada!", desc: "Vá buscar seu pedido no balcão" },
  { key: "entregue",   icon: "✓",  label: "Entregue",              desc: "Bom apetite! 🍽️" },
];

const STATUS_ORDER = ["recebido", "preparando", "pronto", "entregue"];

export default function OrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();
  const order = useQuery(api.orders.getOrderById, {
    orderId: orderId as Id<"orders">,
  });

  const prevStatus = useRef<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation pulsante quand "pronto"
  useEffect(() => {
    if (order?.status === "pronto") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [order?.status]);

  // Alerte sonore + vibration quand le statut change
  useEffect(() => {
    if (!order) return;
    if (prevStatus.current === null) {
      prevStatus.current = order.status;
      return;
    }
    if (prevStatus.current === order.status) return;

    prevStatus.current = order.status;

    if (order.status === "pronto") {
      triggerReadyAlert();
    } else if (order.status === "preparando") {
      triggerStatusAlert();
    }
  }, [order?.status]);

  async function triggerReadyAlert() {
    // Vibration longue + répétée
    if (Platform.OS === "android") {
      Vibration.vibrate([0, 400, 200, 400, 200, 600]);
    } else {
      Vibration.vibrate();
    }

    // Son de notification
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/ready.mp3"),
        { shouldPlay: true, volume: 1.0 }
      );
      setTimeout(() => sound.unloadAsync(), 5000);
    } catch {}

    // Notification push (si app en background)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Seu pedido está pronto!",
        body: "Vá buscar no balcão do food truck.",
        sound: true,
      },
      trigger: null,
    });
  }

  async function triggerStatusAlert() {
    if (Platform.OS === "android") {
      Vibration.vibrate(120);
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/status.mp3"),
        { shouldPlay: true, volume: 0.6 }
      );
      setTimeout(() => sound.unloadAsync(), 3000);
    } catch {}
  }

  if (!order) {
    return (
      <View style={s.loading}>
        <Text style={s.loadingText}>Carregando pedido...</Text>
      </View>
    );
  }

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isReady = order.status === "pronto";

  return (
    <View style={[s.page, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.orderNum}>
          Pedido #{orderId.slice(-4).toUpperCase()}
        </Text>
        <Text style={s.orderTotal}>{formatPrice(order.totalPrice)}</Text>
      </View>

      {/* Status principal */}
      <Animated.View style={[s.statusCard, isReady && s.statusCardReady, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={s.statusIcon}>
          {STEPS[currentStepIndex]?.icon ?? "⏳"}
        </Text>
        <Text style={[s.statusLabel, isReady && s.statusLabelReady]}>
          {STEPS[currentStepIndex]?.label ?? "Processando..."}
        </Text>
        <Text style={s.statusDesc}>
          {STEPS[currentStepIndex]?.desc ?? ""}
        </Text>

        {isReady && (
          <View style={s.readyBadge}>
            <Text style={s.readyBadgeText}>🔔 Alerta sonoro ativado!</Text>
          </View>
        )}
      </Animated.View>

      {/* Timeline de progresso */}
      <View style={s.timeline}>
        {STEPS.slice(0, 4).map((step, i) => {
          const done = i < currentStepIndex;
          const active = i === currentStepIndex;
          return (
            <View key={step.key} style={s.timelineItem}>
              {/* Linha conectora */}
              {i > 0 && (
                <View style={[s.connector, done || active ? s.connectorDone : {}]} />
              )}
              <View style={[
                s.timelineDot,
                done && s.timelineDotDone,
                active && s.timelineDotActive,
              ]}>
                <Text style={s.timelineDotIcon}>
                  {done ? "✓" : step.icon}
                </Text>
              </View>
              <Text style={[
                s.timelineLabel,
                active && s.timelineLabelActive,
                done && s.timelineLabelDone,
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Itens do pedido */}
      <View style={s.itemsCard}>
        <Text style={s.itemsTitle}>Seu pedido</Text>
        {order.items.map((item, i) => (
          <View key={i} style={s.itemRow}>
            <Text style={s.itemQty}>{item.quantity}x</Text>
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
      </View>

      {/* Botão voltar ao menu (só se entregue) */}
      {order.status === "entregue" && (
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={s.backBtnText}>🗺️ Ver mais food trucks</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 20,
  },
  loading: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: "rgba(255,255,255,0.3)", fontSize: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  orderNum: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: "600" },
  orderTotal: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  statusCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statusCardReady: {
    borderColor: "rgba(255,107,53,0.4)",
    backgroundColor: "rgba(255,107,53,0.06)",
  },
  statusIcon: { fontSize: 52, marginBottom: 12 },
  statusLabel: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  statusLabelReady: { color: "#FF6B35" },
  statusDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  readyBadge: {
    marginTop: 16,
    backgroundColor: "rgba(255,107,53,0.15)",
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  readyBadgeText: { color: "#FF6B35", fontSize: 13, fontWeight: "600" },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  timelineItem: { alignItems: "center", flex: 1, position: "relative" },
  connector: {
    position: "absolute",
    top: 16,
    right: "50%",
    left: "-50%",
    height: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 0,
  },
  connectorDone: { backgroundColor: "#FF6B35" },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: "rgba(255,107,53,0.2)",
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  timelineDotDone: { backgroundColor: "#FF6B35" },
  timelineDotIcon: { fontSize: 14 },
  timelineLabel: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  timelineLabelActive: { color: "#FF6B35" },
  timelineLabelDone: { color: "rgba(255,255,255,0.5)" },
  itemsCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 12,
    flex: 1,
  },
  itemsTitle: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemQty: {
    color: "#FF6B35", fontWeight: "700", fontSize: 13,
    width: 28, textAlign: "center",
  },
  itemName: { color: "#FFF", fontSize: 14, flex: 1 },
  itemPrice: { color: "rgba(255,255,255,0.4)", fontSize: 13 },
  backBtn: {
    marginTop: 20,
    backgroundColor: "rgba(255,107,53,0.1)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.2)",
  },
  backBtnText: { color: "#FF6B35", fontWeight: "700", fontSize: 15 },
});

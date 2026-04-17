import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, Alert, ActivityIndicator
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useAction } from "convex/react";
import { useAuth } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatPrice } from "shared/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type PaymentMethod = "pix" | "cartao_credito" | "cartao_debito";

const METHODS: { key: PaymentMethod; icon: string; label: string; desc: string }[] = [
  { key: "pix", icon: "⚡", label: "Pix", desc: "Aprovação instantânea" },
  { key: "cartao_credito", icon: "💳", label: "Crédito", desc: "Taxa 4,99%" },
  { key: "cartao_debito", icon: "🏦", label: "Débito", desc: "Taxa 3,49%" },
];

export default function CheckoutScreen() {
  const { truckId, items: itemsRaw, total } = useLocalSearchParams<{
    truckId: string;
    items: string;
    total: string;
  }>();

  const { isAuthenticated, userId } = useAuth();

  const insets = useSafeAreaInsets();
  const items = JSON.parse(itemsRaw ?? "[]");
  const totalPrice = Number(total ?? 0);

  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [name, setName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const createOrder = useMutation(api.orders.createOrder);
  const createPayment = useAction(api.payments.createPayment);

  async function handlePay() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Atenção", "Preencha seu nome e telefone.");
      return;
    }

    setLoading(true);
    try {
      // 1. Criar pedido no Convex
      const orderId = await createOrder({
        truckId: truckId as Id<"foodTrucks">,
        clientId: userId ?? "guest",
        clientName: name,
        clientPhone: phone,
        items,
        totalPrice,
        paymentMethod: method,
      });

      // 2. Iniciar pagamento no Mercado Pago
      const payment = await createPayment({
        orderId,
        totalPrice,
        paymentMethod: method,
        clientEmail: "cliente@foodtruck.com", // Default for now
        clientName: name,
        description: `Pedido #${orderId.slice(-4).toUpperCase()} — Food Truck`,
      });

      // 3. Redirecionar para acompanhamento
      router.replace(`/order/${orderId}`);

    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível processar o pagamento. Tente novamente.");
      setLoading(false);
    }
  }


  return (
    <View style={[s.page, { paddingBottom: insets.bottom + 16 }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Finalizar pedido</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>

        {/* Resumo dos itens */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Resumo</Text>
          {items.map((item: any, i: number) => (
            <View key={i} style={s.summaryRow}>
              <Text style={s.summaryQty}>{item.quantity}x</Text>
              <Text style={s.summaryName}>{item.name}</Text>
              <Text style={s.summaryPrice}>{formatPrice(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>{formatPrice(totalPrice)}</Text>
          </View>
        </View>

        {/* Dados do cliente */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Seus dados</Text>
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>Nome *</Text>
            <TextInput
              style={s.input}
              placeholder="Seu nome"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={s.inputWrap}>
            <Text style={s.inputLabel}>WhatsApp *</Text>
            <TextInput
              style={s.input}
              placeholder="(11) 99999-9999"
              placeholderTextColor="rgba(255,255,255,0.2)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Método de pagamento */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Forma de pagamento</Text>
          {METHODS.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[s.methodRow, method === m.key && s.methodRowActive]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={s.methodIcon}>{m.icon}</Text>
              <View style={s.methodInfo}>
                <Text style={[s.methodLabel, method === m.key && s.methodLabelActive]}>
                  {m.label}
                </Text>
                <Text style={s.methodDesc}>{m.desc}</Text>
              </View>
              <View style={[s.radio, method === m.key && s.radioActive]}>
                {method === m.key && <View style={s.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Botão pagar */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.payBtn, loading && s.payBtnLoading]}
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={s.payBtnText}>
              Pagar {formatPrice(totalPrice)} via {
                METHODS.find((m) => m.key === method)?.label
              }
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D0D" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40, height: 40,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { color: "#FFF", fontSize: 18, fontWeight: "600" },
  title: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20 },
  section: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryQty: {
    color: "#FF6B35", fontWeight: "700", fontSize: 13,
    width: 28, textAlign: "center",
  },
  summaryName: { color: "#FFF", fontSize: 14, flex: 1 },
  summaryPrice: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    marginTop: 4,
  },
  totalLabel: { color: "rgba(255,255,255,0.5)", fontSize: 15 },
  totalValue: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  inputWrap: { gap: 6 },
  inputLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: "500" },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 14,
    color: "#FFF",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  methodRowActive: {
    borderColor: "rgba(255,107,53,0.4)",
    backgroundColor: "rgba(255,107,53,0.06)",
  },
  methodIcon: { fontSize: 24, width: 32, textAlign: "center" },
  methodInfo: { flex: 1 },
  methodLabel: { color: "rgba(255,255,255,0.6)", fontWeight: "600", fontSize: 15 },
  methodLabelActive: { color: "#FFF" },
  methodDesc: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  radioActive: { borderColor: "#FF6B35" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF6B35" },
  footer: { padding: 20 },
  payBtn: {
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  payBtnLoading: { opacity: 0.7 },
  payBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
});

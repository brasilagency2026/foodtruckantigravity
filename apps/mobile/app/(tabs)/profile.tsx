import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, Alert, TextInput
} from "react-native";
import { useAuth } from "@convex-dev/auth/react";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

export default function ProfileTab() {
  const { isAuthenticated, userId, signOut, signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha e-mail e senha.");
      return;
    }
    setIsLoggingIn(true);
    try {
      await signIn("password", { email, password, flow: "signIn" });
    } catch (e) {
      try {
        await signIn("password", { email, password, flow: "signUp" });
      } catch (err) {
        Alert.alert("Erro", "Não foi possível fazer login. Verifique suas credenciais.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function toggleNotifications(val: boolean) {
    if (val) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Notificações bloqueadas",
          "Ative as notificações nas configurações do seu celular para receber alertas de pedidos."
        );
        return;
      }
    }
    setNotifEnabled(val);
  }

  return (
    <ScrollView
      style={s.page}
      contentContainerStyle={[s.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.title}>Perfil</Text>

      {/* Avatar + info */}
      {isAuthenticated ? (
        <View style={s.avatarCard}>
          <View style={s.avatar}>
            <Text style={s.avatarLetter}>U</Text>
          </View>
          <View style={s.userInfo}>
            <Text style={s.userName}>Usuário Conectado</Text>
            <Text style={s.userEmail}>ID: {userId?.substring(0, 8)}...</Text>
          </View>
        </View>
      ) : (
        <View style={s.loginCard}>
          <Text style={s.loginTitle}>Entrar ou Criar Conta</Text>
          <TextInput
            placeholder="E-mail"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={email}
            onChangeText={setEmail}
            style={s.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={s.input}
          />
          <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={isLoggingIn}>
            <Text style={s.loginBtnText}>{isLoggingIn ? "Carregando..." : "Entrar / Cadastrar"}</Text>
          </TouchableOpacity>
        </View>
      )}


      {/* Configurações de alertas */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Alertas de pedido</Text>

        <SettingRow
          icon="🔔"
          label="Notificações"
          desc="Receber alertas quando o pedido ficar pronto"
          value={notifEnabled}
          onChange={toggleNotifications}
        />
        <SettingRow
          icon="🔊"
          label="Som"
          desc="Alerta sonoro ao atualizar o status"
          value={soundEnabled}
          onChange={setSoundEnabled}
          disabled={!notifEnabled}
        />
        <SettingRow
          icon="📳"
          label="Vibração"
          desc="Vibração ao atualizar o status"
          value={vibrationEnabled}
          onChange={setVibrationEnabled}
          disabled={!notifEnabled}
        />
      </View>

      {/* Sobre o app */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Sobre</Text>
        {[
          { icon: "🍔", label: "Food Pronto", desc: "Versão 1.0.0" },
          { icon: "📋", label: "Termos de uso", onPress: () => {} },
          { icon: "🔒", label: "Política de privacidade", onPress: () => {} },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={s.aboutRow}
            onPress={item.onPress}
            disabled={!item.onPress}
          >
            <Text style={s.aboutIcon}>{item.icon}</Text>
            <View style={s.aboutInfo}>
              <Text style={s.aboutLabel}>{item.label}</Text>
              {item.desc && <Text style={s.aboutDesc}>{item.desc}</Text>}
            </View>
            {item.onPress && <Text style={s.aboutArrow}>→</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      {isAuthenticated && (
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={() =>
            Alert.alert("Sair", "Tem certeza que deseja sair?", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sair", style: "destructive", onPress: () => signOut() },
            ])
          }
        >
          <Text style={s.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function SettingRow({
  icon, label, desc, value, onChange, disabled,
}: {
  icon: string;
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[sr.row, disabled && sr.rowDisabled]}>
      <Text style={sr.icon}>{icon}</Text>
      <View style={sr.info}>
        <Text style={[sr.label, disabled && sr.labelDisabled]}>{label}</Text>
        <Text style={sr.desc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: "rgba(255,255,255,0.1)", true: "rgba(255,107,53,0.4)" }}
        thumbColor={value ? "#FF6B35" : "rgba(255,255,255,0.4)"}
        ios_backgroundColor="rgba(255,255,255,0.1)"
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0D0D0D" },
  content: { paddingHorizontal: 20, gap: 20 },
  title: { color: "#FFF", fontSize: 26, fontWeight: "800" },
  avatarCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,107,53,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  avatarLetter: { color: "#FF6B35", fontSize: 22, fontWeight: "800" },
  userInfo: { flex: 1 },
  userName: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  userEmail: { color: "rgba(255,255,255,0.35)", fontSize: 13, marginTop: 3 },
  loginCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  loginTitle: { color: "#FFF", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 12,
    color: "#FFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  loginBtn: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  loginBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  section: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    padding: 16,
    paddingBottom: 8,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  aboutIcon: { fontSize: 20, width: 28, textAlign: "center" },
  aboutInfo: { flex: 1 },
  aboutLabel: { color: "#FFF", fontSize: 15, fontWeight: "500" },
  aboutDesc: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 },
  aboutArrow: { color: "rgba(255,255,255,0.2)", fontSize: 16 },
  logoutBtn: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    alignItems: "center",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  logoutText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },
});


const sr = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  rowDisabled: { opacity: 0.4 },
  icon: { fontSize: 20, width: 28, textAlign: "center" },
  info: { flex: 1 },
  label: { color: "#FFF", fontSize: 15, fontWeight: "500" },
  labelDisabled: { color: "rgba(255,255,255,0.4)" },
  desc: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 2 },
});

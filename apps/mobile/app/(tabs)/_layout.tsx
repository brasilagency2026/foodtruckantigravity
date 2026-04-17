import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

const IS_OWNER = !!process.env.EXPO_PUBLIC_KITCHEN_TRUCK_ID;

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[tab.wrap, focused && tab.wrapActive]}>
      <Text style={tab.icon}>{icon}</Text>
      <Text style={[tab.label, focused && tab.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111",
          borderTopColor: "rgba(255,255,255,0.06)",
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🗺️" label="Mapa" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: () => (
            <View style={tab.scanBtn}>
              <Text style={{ fontSize: 22 }}>📷</Text>
            </View>
          ),
        }}
      />
      {IS_OWNER ? (
        <Tabs.Screen
          name="cozinha"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="👨‍🍳" label="Cozinha" focused={focused} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen
          name="orders"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📋" label="Pedidos" focused={focused} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const tab = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 4,
    paddingTop: 8,
    opacity: 0.4,
  },
  wrapActive: { opacity: 1 },
  icon: { fontSize: 22 },
  label: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  labelActive: { color: "#FF6B35" },
  scanBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});

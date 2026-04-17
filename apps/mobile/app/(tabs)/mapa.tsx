import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { router } from "expo-router";

export default function MapaScreen() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const trucks = useQuery(api.foodTrucks.getNearbyTrucks, 
    location ? {
      latitude: location.latitude,
      longitude: location.longitude,
      radiusKm: 5,
    } : "skip"
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão negada", "Precisamos da sua localização para mostrar food trucks próximos.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>📍 Obtendo sua localização...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...location,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {trucks?.map((truck) => (
          <Marker
            key={truck._id}
            coordinate={{
              latitude: truck.latitude,
              longitude: truck.longitude,
            }}
            pinColor={truck.isOpen ? "#FF6B35" : "#999"}
          >
            <Callout
              onPress={() => router.push(`/truck/${truck._id}`)}
              style={styles.callout}
            >
              <Text style={styles.calloutName}>{truck.name}</Text>
              <Text style={styles.calloutCuisine}>{truck.cuisine}</Text>
              <Text style={styles.calloutRating}>⭐ {truck.rating.toFixed(1)}</Text>
              <Text style={[styles.calloutStatus, truck.isOpen ? styles.open : styles.closed]}>
                {truck.isOpen ? "🟢 Aberto" : "🔴 Fechado"}
              </Text>
              <Text style={styles.calloutAction}>Ver cardápio →</Text>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendText}>🟠 Aberto · ⚫ Fechado</Text>
        <Text style={styles.legendCount}>
          {trucks?.filter((t) => t.isOpen).length ?? 0} trucks abertos perto de você
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF8F5",
  },
  loadingText: { fontSize: 16, color: "#666" },
  callout: { width: 180, padding: 4 },
  calloutName: { fontSize: 15, fontWeight: "700", color: "#1A1A1A" },
  calloutCuisine: { fontSize: 12, color: "#666", marginTop: 2 },
  calloutRating: { fontSize: 12, marginTop: 4 },
  calloutStatus: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  open: { color: "#22C55E" },
  closed: { color: "#EF4444" },
  calloutAction: { fontSize: 12, color: "#FF6B35", marginTop: 6, fontWeight: "600" },
  legend: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendText: { fontSize: 12, color: "#666" },
  legendCount: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", marginTop: 2 },
});

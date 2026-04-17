import { useEffect } from "react";
import { Stack } from "expo-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

// Adaptateur SecureStore pour Convex Auth
const storage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Syne-Bold": require("../assets/fonts/Syne-Bold.ttf"),
    "Syne-ExtraBold": require("../assets/fonts/Syne-ExtraBold.ttf"),
    "DMSans-Regular": require("../assets/fonts/DMSans-Regular.ttf"),
    "DMSans-Medium": require("../assets/fonts/DMSans-Medium.ttf"),
    "DMSans-Bold": require("../assets/fonts/DMSans-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexAuthProvider client={convex} storage={storage}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0D0D0D" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="menu/[truckId]" />
          <Stack.Screen name="checkout" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="order/[orderId]" options={{ animation: "slide_from_bottom" }} />
          <Stack.Screen name="scan" options={{ presentation: "fullScreenModal" }} />
        </Stack>
      </ConvexAuthProvider>
    </GestureHandlerRootView>
  );
}


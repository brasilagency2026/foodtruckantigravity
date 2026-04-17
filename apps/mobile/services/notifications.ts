import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

// ============================================
// CONFIGURATION DES NOTIFICATIONS
// À appeler au démarrage de l'app (_layout.tsx)
// ============================================

// Handler pour les notifications reçues en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Demander les permissions et retourner le token push
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Notifications indisponibles sur simulateur");
    return null;
  }

  // Canal Android
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Pedidos",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 400, 200, 400],
      sound: "ready.wav",
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true, // Passa pelo modo não-perturbe!
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
  });

  return token.data;
}

/**
 * Envoyer une notification locale immédiate
 * (quand le statut change via Convex en foreground)
 */
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // immédiat
  });
}

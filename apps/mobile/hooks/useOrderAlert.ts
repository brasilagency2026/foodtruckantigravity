import { useEffect, useRef } from "react";
import { Vibration, Platform } from "react-native";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";

type OrderStatus = "recebido" | "preparando" | "pronto" | "entregue" | "cancelado";

interface UseOrderAlertOptions {
  status: OrderStatus | undefined;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

/**
 * Hook para alertas sonoros e vibração ao mudar o status do pedido.
 * Usado tanto na tela de acompanhamento do cliente
 * quanto no painel da cozinha.
 */
export function useOrderAlert({
  status,
  soundEnabled = true,
  vibrationEnabled = true,
}: UseOrderAlertOptions) {
  const prevStatus = useRef<OrderStatus | undefined>(undefined);

  useEffect(() => {
    if (!status) return;

    // Ignorar a primeira renderização
    if (prevStatus.current === undefined) {
      prevStatus.current = status;
      return;
    }

    // Só disparar se o status MUDOU
    if (prevStatus.current === status) return;
    const previous = prevStatus.current;
    prevStatus.current = status;

    // Pedido PRONTO — alerta máximo
    if (status === "pronto") {
      if (vibrationEnabled) {
        if (Platform.OS === "android") {
          Vibration.vibrate([0, 400, 200, 400, 200, 600]);
        } else {
          // iOS: vibrate 3x com intervalo
          Vibration.vibrate();
          setTimeout(() => Vibration.vibrate(), 700);
          setTimeout(() => Vibration.vibrate(), 1400);
        }
      }

      if (soundEnabled) {
        playSound(require("../assets/sounds/ready.mp3"), 1.0);
      }

      // Notification push (app em background)
      Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Seu pedido está pronto!",
          body: "Vá buscar no balcão do food truck.",
          sound: true,
        },
        trigger: null,
      }).catch(() => {});

      return;
    }

    // Pedido PREPARANDO — alerta médio
    if (status === "preparando") {
      if (vibrationEnabled && Platform.OS === "android") {
        Vibration.vibrate(150);
      }
      if (soundEnabled) {
        playSound(require("../assets/sounds/status.mp3"), 0.7);
      }
      return;
    }

    // Novo pedido RECEBIDO (para a cozinha)
    if (status === "recebido" && previous === undefined) {
      if (vibrationEnabled && Platform.OS === "android") {
        Vibration.vibrate([0, 200, 100, 200]);
      }
      if (soundEnabled) {
        playSound(require("../assets/sounds/new-order.mp3"), 1.0);
      }
    }
  }, [status]);
}

async function playSound(source: any, volume: number) {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Passa pelo modo silencioso no iOS!
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
    });

    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: true,
      volume,
    });

    // Liberar memória após reprodução
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (e) {
    console.warn("Erro ao reproduzir som:", e);
  }
}

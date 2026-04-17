import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Vibration, Platform
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MENU_URL_PATTERN = /\/menu\/([a-zA-Z0-9]+)/;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");
  const insets = useSafeAreaInsets();

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return;

    // Valider que c'est bien une URL de notre app
    const match = data.match(MENU_URL_PATTERN);
    if (!match) {
      setError("QR Code inválido. Aponte para o QR Code de um food truck.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setScanned(true);
    const truckId = match[1];

    // Vibration de confirmation
    if (Platform.OS === "android") {
      Vibration.vibrate(80);
    }

    // Naviguer vers le menu
    setTimeout(() => {
      router.push(`/menu/${truckId}`);
      setScanned(false);
    }, 300);
  }

  if (!permission) return <View style={s.container} />;

  if (!permission.granted) {
    return (
      <View style={[s.container, s.permissionWrap]}>
        <Text style={s.permissionIcon}>📷</Text>
        <Text style={s.permissionTitle}>Câmera necessária</Text>
        <Text style={s.permissionDesc}>
          Precisamos da câmera para escanear o QR Code do food truck.
        </Text>
        <TouchableOpacity style={s.permissionBtn} onPress={requestPermission}>
          <Text style={s.permissionBtnText}>Permitir câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      {/* Overlay escuro nas bordas */}
      <View style={s.overlay}>
        {/* Topo */}
        <View style={[s.overlaySection, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={s.title}>Escanear QR Code</Text>
          <Text style={s.subtitle}>Aponte para o QR Code do food truck</Text>
        </View>

        {/* Meio — janela de scan */}
        <View style={s.middleRow}>
          <View style={s.sideOverlay} />
          <View style={s.scanWindow}>
            {/* Cantos animados */}
            <View style={[s.corner, s.cornerTL]} />
            <View style={[s.corner, s.cornerTR]} />
            <View style={[s.corner, s.cornerBL]} />
            <View style={[s.corner, s.cornerBR]} />

            {/* Linha de scan */}
            {!scanned && <View style={s.scanLine} />}

            {/* Feedback de scan réussi */}
            {scanned && (
              <View style={s.successOverlay}>
                <Text style={s.successIcon}>✓</Text>
              </View>
            )}
          </View>
          <View style={s.sideOverlay} />
        </View>

        {/* Bas */}
        <View style={[s.overlaySection, { paddingBottom: insets.bottom + 24 }]}>
          {error ? (
            <View style={s.errorBadge}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : (
            <Text style={s.hint}>
              {scanned ? "✅ QR Code lido!" : "Centralize o QR Code na área acima"}
            </Text>
          )}
        </View>
      </View>

      <style>{`
        @keyframes scanMove {
          0%, 100% { top: 8px; }
          50% { top: calc(100% - 12px); }
        }
      `}</style>
    </View>
  );
}

const WINDOW = 260;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionWrap: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#0D0D0D",
  },
  permissionIcon: { fontSize: 56, marginBottom: 16 },
  permissionTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionDesc: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
  },
  permissionBtn: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  overlaySection: {
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    padding: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  title: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  middleRow: {
    flexDirection: "row",
    height: WINDOW,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  scanWindow: {
    width: WINDOW,
    height: WINDOW,
    position: "relative",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#FF6B35",
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: "#FF6B35",
    opacity: 0.8,
    top: "50%",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 6,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34,197,94,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    fontSize: 56,
    color: "#22C55E",
    fontWeight: "800",
  },
  hint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
  },
  errorBadge: {
    backgroundColor: "rgba(239,68,68,0.2)",
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});

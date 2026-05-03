"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type OS = "ios" | "android" | "other";
type AppState = "checking" | "not-installed";

interface SmartLandingProps {
  truckId: string;
  truckName: string;
  truckCuisine: string;
  coverPhotoUrl: string;
  onContinueWeb: () => void;
}

function detectOS(): OS {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

export function SmartLanding({
  truckId,
  truckName,
  truckCuisine,
  coverPhotoUrl,
  onContinueWeb,
}: SmartLandingProps) {
  const [os, setOs] = useState<OS>("other");
  const [appState, setAppState] = useState<AppState>("checking");
  const [visible, setVisible] = useState(false);

  const APP_SCHEME = `foodtruckalert://menu/${truckId}`;
  const APP_STORE_URL = "https://apps.apple.com/app/food-pronto/id000000000";
  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.foodtruckalert";

  useEffect(() => {
    const detectedOs = detectOS();
    setOs(detectedOs);

    if (detectedOs === "other") {
      // Desktop → vai direto para o cardápio web
      onContinueWeb();
      return;
    }

    // Tenta abrir o app via deep link
    const start = Date.now();
    window.location.href = APP_SCHEME;

    // Se o app abrir, a aba ficará em background e este timeout não vai disparar
    // Se não abrir (app não instalado), mostramos a landing após 1.5s
    const timeout = setTimeout(() => {
      const elapsed = Date.now() - start;
      if (elapsed < 2000) {
        // App não abriu → mostrar opções
        setAppState("not-installed");
        setVisible(true);
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  if (!visible) {
    return (
      <div style={styles.checking}>
        <div style={styles.spinnerWrap}>
          <div style={styles.spinner} />
        </div>
        <p style={styles.checkingText}>Abrindo Food Pronto...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background com foto do truck */}
      <div style={styles.hero}>
        {coverPhotoUrl && (
          <img src={coverPhotoUrl} alt={truckName} style={styles.heroImg} />
        )}
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <span style={styles.emoji}>🍔</span>
          <h1 style={styles.truckName}>{truckName}</h1>
          <p style={styles.cuisine}>{truckCuisine}</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={styles.content}>

        {/* Download do app */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>📱</span>
            <div>
              <h2 style={styles.cardTitle}>Melhor com o app</h2>
              <p style={styles.cardSubtitle}>Receba alertas sonoros e vibração quando seu pedido ficar pronto</p>
            </div>
          </div>

          {/* Vantagens do app */}
          <div style={styles.perks}>
            {[
              { icon: "🔔", text: "Alerta sonoro quando o pedido fica pronto" },
              { icon: "📳", text: "Vibração no celular — nunca perca seu pedido" },
              { icon: "🗺️", text: "Mapa com todos os food trucks próximos" },
              { icon: "⚡", text: "Acompanhamento em tempo real" },
            ].map((perk, i) => (
              <div key={i} style={styles.perk}>
                <span style={styles.perkIcon}>{perk.icon}</span>
                <span style={styles.perkText}>{perk.text}</span>
              </div>
            ))}
          </div>

          {/* Botão store */}
          {os === "ios" && (
            <a href={APP_STORE_URL} style={styles.storeBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Baixar na App Store
            </a>
          )}

          {os === "android" && (
            <a href={PLAY_STORE_URL} style={styles.storeBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M3.18 23.76c.3.17.64.22.99.14l12.82-7.38-2.79-2.79-11.02 10.03zM.35 1.09C.13 1.43 0 1.88 0 2.44v19.12c0 .56.13 1.01.35 1.35l.07.07 10.7-10.7v-.25L.42 1.02.35 1.09zM20.96 10.8l-2.72-1.57-3.06 3.06 3.06 3.06 2.74-1.58c.78-.45.78-1.52-.02-1.97zM4.17.24l12.82 7.38-2.79 2.79L3.18.24C3.53.16 3.87.07 4.17.24z"/>
              </svg>
              Baixar no Google Play
            </a>
          )}
        </div>

        {/* Divisor */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>ou</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Continuar no navegador */}
        <button onClick={onContinueWeb} style={styles.webBtn}>
          Continuar no navegador
          <span style={styles.webBtnNote}> — sem alertas sonoros</span>
        </button>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  checking: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0D0D0D",
    gap: 16,
  },
  spinnerWrap: {
    width: 48,
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid rgba(255,107,53,0.2)",
    borderTop: "3px solid #FF6B35",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  checkingText: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "system-ui",
    fontSize: 14,
  },
  container: {
    minHeight: "100vh",
    background: "#0D0D0D",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    animation: "fadeUp 0.5s ease",
  },
  hero: {
    position: "relative",
    height: 240,
    overflow: "hidden",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(13,13,13,0.3), rgba(13,13,13,0.95))",
  },
  heroContent: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  emoji: {
    fontSize: 32,
    display: "block",
    marginBottom: 8,
  },
  truckName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.1,
    fontFamily: "'Syne', system-ui, sans-serif",
  },
  cuisine: {
    color: "#FF6B35",
    fontSize: 14,
    margin: "6px 0 0",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  content: {
    padding: "24px 20px 48px",
  },
  card: {
    background: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    border: "1px solid rgba(255,107,53,0.15)",
  },
  cardHeader: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 36,
    flexShrink: 0,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 700,
    margin: "0 0 4px",
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    margin: 0,
    lineHeight: 1.4,
  },
  perks: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
  },
  perk: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  perkIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
    flexShrink: 0,
  },
  perkText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 1.4,
  },
  storeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    padding: "16px 24px",
    background: "#FF6B35",
    color: "#FFFFFF",
    borderRadius: 14,
    fontWeight: 700,
    fontSize: 16,
    textDecoration: "none",
    boxSizing: "border-box",
    boxShadow: "0 8px 24px rgba(255,107,53,0.35)",
    transition: "transform 0.1s, box-shadow 0.1s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  webBtn: {
    width: "100%",
    padding: "16px 24px",
    background: "transparent",
    color: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  webBtnNote: {
    fontSize: 12,
    opacity: 0.6,
  },
};

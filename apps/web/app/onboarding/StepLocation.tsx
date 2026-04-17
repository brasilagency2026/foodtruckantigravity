"use client";

import { useState, useEffect, useRef } from "react";
import { OnboardingData } from "./page";
import { StepHeader, Input, NextButton, BackButton } from "./components";

interface Props {
  data: Partial<OnboardingData>;
  onBack: () => void;
  onNext: (fields: Pick<OnboardingData, "latitude" | "longitude" | "address">) => void;
}

export function StepLocation({ data, onBack, onNext }: Props) {
  const [address, setAddress] = useState(data.address ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    data.latitude ? { lat: data.latitude, lng: data.longitude! } : null
  );
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  // Géolocalisation automatique
  async function useMyLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });

        // Reverse geocoding via Google
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
          );
          const json = await res.json();
          if (json.results[0]) {
            setAddress(json.results[0].formatted_address);
          }
        } catch {}
        setLocating(false);
      },
      () => {
        setError("Não foi possível obter sua localização.");
        setLocating(false);
      }
    );
  }

  // Geocoding por endereço digitado
  async function searchAddress() {
    if (!address.trim()) return;
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
      );
      const json = await res.json();
      if (json.results[0]) {
        const loc = json.results[0].geometry.location;
        setCoords({ lat: loc.lat, lng: loc.lng });
        setAddress(json.results[0].formatted_address);
      }
    } catch {
      setError("Endereço não encontrado.");
    }
  }

  function handleNext() {
    if (!coords) {
      setError("Defina a localização do seu truck.");
      return;
    }
    onNext({ latitude: coords.lat, longitude: coords.lng, address });
  }

  return (
    <div>
      <StepHeader
        emoji="📍"
        title="Onde fica seu truck?"
        subtitle="Os clientes vão te encontrar no mapa. Você pode atualizar sua posição a qualquer momento."
      />

      {/* Botão localização automática */}
      <button style={s.geoBtn} onClick={useMyLocation} disabled={locating}>
        {locating ? "📍 Obtendo localização..." : "📍 Usar minha localização atual"}
      </button>

      <div style={s.divider}>
        <div style={s.line} /><span style={s.or}>ou</span><div style={s.line} />
      </div>

      {/* Campo de endereço */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          style={s.input}
          placeholder="Digite o endereço..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchAddress()}
        />
        <button style={s.searchBtn} onClick={searchAddress}>Buscar</button>
      </div>

      {/* Mapa estático mostrando o pin */}
      {coords && (
        <div style={s.mapWrap}>
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${coords.lat},${coords.lng}&zoom=16&size=520x200&scale=2&markers=color:0xFF6B35|${coords.lat},${coords.lng}&style=element:geometry|color:0x1a1a1a&style=element:labels.text.fill|color:0x757575&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`}
            alt="Localização"
            style={s.mapImg}
          />
          <div style={s.mapPin}>📍</div>
        </div>
      )}

      {error && <p style={s.error}>{error}</p>}

      {coords && (
        <p style={s.coordsText}>
          ✅ {address || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
        </p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <BackButton onClick={onBack} />
        <NextButton onClick={handleNext} label="Próximo — Foto →" flex />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  geoBtn: {
    width: "100%",
    padding: "16px",
    background: "rgba(255,107,53,0.1)",
    border: "1px solid rgba(255,107,53,0.3)",
    borderRadius: 14,
    color: "#FF6B35",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: 20,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  line: { flex: 1, height: 1, background: "rgba(255,255,255,0.08)" },
  or: { color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 500, textTransform: "uppercase" },
  input: {
    flex: 1,
    padding: "14px 16px",
    background: "#1A1A1A",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#FFF",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
  },
  searchBtn: {
    padding: "14px 20px",
    background: "#FF6B35",
    border: "none",
    borderRadius: 12,
    color: "#FFF",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  mapWrap: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  mapImg: {
    width: "100%",
    display: "block",
    borderRadius: 16,
  },
  mapPin: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -100%)",
    fontSize: 28,
  },
  coordsText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    margin: 0,
    lineHeight: 1.4,
  },
  error: {
    color: "#FF4444",
    fontSize: 13,
    margin: "8px 0 0",
  },
};

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Truck {
  _id: string;
  name: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  rating: number;
  totalReviews: number;
  coverPhotoUrl: string;
  address: string;
  distance?: number;
}

type OS = "ios" | "android" | "other";

// ─── Constants ────────────────────────────────────────────────────────────────

const RADIUS_KM = 10;
const APP_STORE_URL = "https://apps.apple.com/app/food-truck-alert/id000000000";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.foodtruckalert";

const CUISINE_ICONS: Record<string, string> = {
  "Todos": "🍽️",
  "Hambúrgueres": "🍔",
  "Tacos & Mexicano": "🌮",
  "Pizza": "🍕",
  "Japonês / Sushi": "🍣",
  "Árabe / Esfiha": "🥙",
  "Churrasco": "🥩",
  "Frutos do Mar": "🦐",
  "Vegano": "🥗",
  "Sorvetes & Açaí": "🍦",
  "Bebidas & Drinks": "🍹",
};

// ─── Haversine distance ───────────────────────────────────────────────────────

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectOS(): OS {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState("Todos");
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [os, setOs] = useState<OS>("other");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const trucks = useQuery(
    api.foodTrucks.getNearbyTrucks,
    userLocation
      ? { latitude: userLocation.lat, longitude: userLocation.lng, radiusKm: RADIUS_KM }
      : "skip"
  ) as Truck[] | undefined;

  // Compute distances
  const trucksWithDistance: Truck[] = (trucks ?? []).map((t) => ({
    ...t,
    distance: userLocation
      ? haversine(userLocation.lat, userLocation.lng, t.latitude, t.longitude)
      : undefined,
  })).sort((a, b) => (a.distance ?? 99) - (b.distance ?? 99));

  const cuisines = ["Todos", ...Array.from(new Set(trucksWithDistance.map((t) => t.cuisine)))];

  const filtered =
    selectedCuisine === "Todos"
      ? trucksWithDistance
      : trucksWithDistance.filter((t) => t.cuisine === selectedCuisine);

  // ── Geolocation ─────────────────────────────────────────────────────────────

  useEffect(() => {
    setOs(detectOS());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          setLocationError(true);
          // Fallback: São Paulo centro
          setUserLocation({ lat: -23.5505, lng: -46.6333 });
        }
      );
    } else {
      setUserLocation({ lat: -23.5505, lng: -46.6333 });
    }
  }, []);

  // ── Load Google Maps ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userLocation || mapLoaded) return;
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!key) return;

    if (window.google?.maps) { initMap(); return; }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, [userLocation]);

  function initMap() {
    if (!mapRef.current || !userLocation) return;
    setMapLoaded(true);

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: userLocation.lat, lng: userLocation.lng },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      styles: DARK_MAP_STYLE,
    });

    mapInstanceRef.current = map;

    // User dot
    new google.maps.Marker({
      position: { lat: userLocation.lat, lng: userLocation.lng },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF6B35",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
      title: "Você está aqui",
    });

    infoWindowRef.current = new google.maps.InfoWindow();
  }

  // ── Update markers when trucks change ────────────────────────────────────────

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    filtered.forEach((truck) => {
      const isActive = truck.isOpen;
      const marker = new google.maps.Marker({
        position: { lat: truck.latitude, lng: truck.longitude },
        map,
        title: truck.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: isActive ? "#22C55E" : "#EF4444",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
        animation: isActive ? google.maps.Animation.DROP : undefined,
      });

      marker.addListener("click", () => {
        setSelectedTruck(truck);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(buildInfoWindow(truck));
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.set(truck._id, marker);
    });
  }, [filtered, mapLoaded]);

  function buildInfoWindow(truck: Truck): string {
    const dist = truck.distance ? `${truck.distance.toFixed(1)} km` : "";
    const status = truck.isOpen
      ? `<span style="color:#22C55E;font-weight:700">● Aberto</span>`
      : `<span style="color:#EF4444;font-weight:700">● Fechado</span>`;
    return `
      <div style="font-family:system-ui;padding:4px;min-width:180px">
        <div style="font-weight:700;font-size:14px;margin-bottom:4px">${truck.name}</div>
        <div style="font-size:12px;color:#666;margin-bottom:6px">${truck.cuisine}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          ${status}
          ${dist ? `<span style="font-size:12px;color:#888">${dist}</span>` : ""}
        </div>
        <a href="/t/${truck._id}" style="display:block;background:#FF6B35;color:#fff;text-align:center;padding:8px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none">
          Pedir agora
        </a>
      </div>
    `;
  }

  function focusTruck(truck: Truck) {
    setSelectedTruck(truck);
    const map = mapInstanceRef.current;
    if (map) {
      map.panTo({ lat: truck.latitude, lng: truck.longitude });
      map.setZoom(15);
    }
    const marker = markersRef.current.get(truck._id);
    if (marker && infoWindowRef.current) {
      infoWindowRef.current.setContent(buildInfoWindow(truck));
      infoWindowRef.current.open(map!, marker);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
        </div>
        <nav className="nav">
          <div className="nav-logo">
            <span className="logo-icon">🍔</span>
            <span className="logo-text">Food Truck Alert</span>
          </div>
          <div className="nav-actions">
            <a href="/auth" className="btn-ghost">Entrar</a>
            <a href="/onboarding" className="btn-primary-sm">Cadastrar meu truck</a>
          </div>

        </nav>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Trucks abertos agora perto de você
          </div>
          <h1 className="hero-title">
            Comida de rua,<br />
            <span className="hero-accent">na palma da mão</span>
          </h1>
          <p className="hero-subtitle">
            Descubra food trucks próximos, peça pelo celular e receba um alerta sonoro quando sua comida estiver pronta.
          </p>
          <div className="hero-cta">
            {os === "ios" && (
              <a href={APP_STORE_URL} className="btn-store">
                <AppleIcon />
                <div>
                  <span className="store-sub">Baixar na</span>
                  <span className="store-main">App Store</span>
                </div>
              </a>
            )}
            {os === "android" && (
              <a href={PLAY_STORE_URL} className="btn-store">
                <PlayIcon />
                <div>
                  <span className="store-sub">Disponível no</span>
                  <span className="store-main">Google Play</span>
                </div>
              </a>
            )}
            {os === "other" && (
              <>
                <a href={APP_STORE_URL} className="btn-store">
                  <AppleIcon />
                  <div>
                    <span className="store-sub">Baixar na</span>
                    <span className="store-main">App Store</span>
                  </div>
                </a>
                <a href={PLAY_STORE_URL} className="btn-store">
                  <PlayIcon />
                  <div>
                    <span className="store-sub">Disponível no</span>
                    <span className="store-main">Google Play</span>
                  </div>
                </a>
              </>
            )}
            <a href="#mapa" className="btn-outline">
              Ver no mapa ↓
            </a>
          </div>
          <div className="hero-alert-hint">
            <span className="hint-icon">🔔</span>
            <span>App exclusivo: vibração + alerta sonoro quando seu pedido estiver pronto</span>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <div className="scroll-line" />
        </div>
      </section>

      {/* ── MAP SECTION ── */}
      <section className="map-section" id="mapa">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Food trucks próximos</h2>
            <p className="section-sub">
              {locationError
                ? "Usando localização padrão — São Paulo"
                : userLocation
                ? `Raio de ${RADIUS_KM} km a partir da sua localização`
                : "Obtendo sua localização..."}
            </p>
          </div>
          <div className="truck-count">
            <span className="count-num">{filtered.length}</span>
            <span className="count-label">trucks encontrados</span>
          </div>
        </div>

        {/* Cuisine filters */}
        <div className="filters-row">
          {cuisines.map((c) => (
            <button
              key={c}
              className={`filter-btn ${selectedCuisine === c ? "active" : ""}`}
              onClick={() => setSelectedCuisine(c)}
            >
              <span className="filter-icon">{CUISINE_ICONS[c] ?? "🍴"}</span>
              {c}
            </button>
          ))}
        </div>

        {/* Map + List */}
        <div className="map-layout">
          {/* Map */}
          <div className="map-container">
            <div ref={mapRef} className="map-canvas" />
            {!mapLoaded && (
              <div className="map-loading">
                <div className="map-spinner" />
                <span>Carregando mapa...</span>
              </div>
            )}
            <div className="map-legend">
              <span className="legend-dot open" />Aberto
              <span className="legend-dot closed" style={{ marginLeft: 12 }} />Fechado
            </div>
          </div>

          {/* Truck list */}
          <div className="truck-list">
            {!userLocation ? (
              <div className="list-loading">
                <div className="map-spinner" />
                <span>Detectando localização...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="list-empty">
                <span className="empty-icon">🔍</span>
                <p>Nenhum truck encontrado nessa categoria no raio de {RADIUS_KM} km.</p>
              </div>
            ) : (
              filtered.map((truck) => (
                <TruckCard
                  key={truck._id}
                  truck={truck}
                  selected={selectedTruck?._id === truck._id}
                  onClick={() => focusTruck(truck)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD SECTION ── */}
      <section className="app-section">
        <div className="app-inner">
          <div className="app-text">
            <div className="app-eyebrow">Melhor no app</div>
            <h2 className="app-title">
              Nunca perca<br />seu pedido pronto
            </h2>
            <p className="app-body">
              No navegador você acompanha o pedido — mas só o app avisa com <strong>alerta sonoro e vibração</strong> quando a sua comida está pronta no balcão.
            </p>
            <div className="app-perks">
              {[
                { icon: "🔔", title: "Alerta sonoro", desc: "Som inconfundível quando pronto" },
                { icon: "📳", title: "Vibração no celular", desc: "Mesmo com o som no mudo" },
                { icon: "🗺️", title: "Mapa ao vivo", desc: "Trucks abertos agora, perto de você" },
                { icon: "⚡", title: "Pedido em segundos", desc: "Cardápio pelo QR Code" },
              ].map((p) => (
                <div key={p.title} className="perk-row">
                  <span className="perk-icon">{p.icon}</span>
                  <div>
                    <div className="perk-title">{p.title}</div>
                    <div className="perk-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="store-buttons">
              <a href={APP_STORE_URL} className="btn-store-dark">
                <AppleIcon />
                <div>
                  <span className="store-sub">Baixar na</span>
                  <span className="store-main">App Store</span>
                </div>
              </a>
              <a href={PLAY_STORE_URL} className="btn-store-dark">
                <PlayIcon />
                <div>
                  <span className="store-sub">Disponível no</span>
                  <span className="store-main">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Fake phone mockup */}
          <div className="phone-mockup">
            <div className="phone-frame">
              <div className="phone-notch" />
              <div className="phone-screen">
                <div className="phone-status-bar">
                  <span>9:41</span>
                  <span>●●●</span>
                </div>
                <div className="phone-alert">
                  <div className="alert-icon">🔔</div>
                  <div className="alert-content">
                    <div className="alert-app">Food Truck Alert</div>
                    <div className="alert-title">Seu pedido está pronto!</div>
                    <div className="alert-body">Busque no balcão do truck 🍔</div>
                  </div>
                </div>
                <div className="phone-order-card">
                  <div className="order-header-phone">
                    <span className="order-id">#A3F2</span>
                    <span className="order-ready">✓ Pronto!</span>
                  </div>
                  <div className="order-items-phone">
                    <div>2× Smash Burger</div>
                    <div>1× Batata Frita</div>
                  </div>
                  <div className="order-progress">
                    {["Recebido", "Preparando", "Pronto"].map((s, i) => (
                      <div key={s} className={`progress-step ${i <= 2 ? "done" : ""}`}>
                        <div className="step-dot" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="phone-vibrate-hint">
                  <span>📳</span> Vibração ativada
                </div>
              </div>
            </div>
            <div className="phone-glow" />
          </div>
        </div>
      </section>

      {/* ── OWNER CTA + PRICING TEASER ── */}
      <section className="owner-section">
        <div className="owner-inner">
          <span className="owner-emoji">🚚</span>
          <h2 className="owner-title">Você tem um food truck?</h2>
          <p className="owner-body">
            Cadastre-se, crie seu cardápio digital e comece a receber pedidos hoje mesmo.
            Sem maquininha, sem painel LED — tudo pelo celular.
          </p>
          <div className="pricing-teaser">
            <div className="pricing-teaser-left">
              <div className="pricing-free-badge">
                <span className="pricing-free-n">30</span>
                <span className="pricing-free-l">dias grátis</span>
              </div>
              <div>
                <div className="pricing-price">R$ 200<span className="pricing-mo">/mês</span></div>
                <div className="pricing-note">Sem contrato. Cancele quando quiser.</div>
              </div>
            </div>
            <div className="pricing-highlights">
              {["✓  Sem maquininha de cartão","✓  Sem painel LED de senha","✓  Pix, crédito e débito via Mercado Pago","✓  Cliente recebe alerta no celular"].map((t) => (
                <div key={t} className="pricing-hl">{t}</div>
              ))}
            </div>
          </div>
          <div className="owner-btns">
            <a href="/onboarding" className="btn-owner">Começar 30 dias grátis →</a>
            <a href="/precos" className="btn-owner-ghost">Ver todos os detalhes</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <span>🍔</span> Food Truck Alert
          </div>
          <div className="footer-links">
            <a href="/precos">Preços</a>
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/contato">Contato</a>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Food Truck Alert. Feito com ❤️ no Brasil.</p>
        </div>
      </footer>
    </>
  );
}

// ─── Truck Card ───────────────────────────────────────────────────────────────

function TruckCard({ truck, selected, onClick }: { truck: Truck; selected: boolean; onClick: () => void }) {
  return (
    <div className={`truck-card ${selected ? "selected" : ""}`} onClick={onClick}>
      {truck.coverPhotoUrl && (
        <img src={truck.coverPhotoUrl} alt={truck.name} className="truck-thumb" />
      )}
      <div className="truck-info">
        <div className="truck-name-row">
          <span className="truck-name">{truck.name}</span>
          <span className={`status-pill ${truck.isOpen ? "open" : "closed"}`}>
            {truck.isOpen ? "Aberto" : "Fechado"}
          </span>
        </div>
        <span className="truck-cuisine">{truck.cuisine}</span>
        <div className="truck-meta">
          {truck.rating > 0 && (
            <span className="truck-rating">⭐ {truck.rating.toFixed(1)}</span>
          )}
          {truck.distance !== undefined && (
            <span className="truck-dist">📍 {truck.distance.toFixed(1)} km</span>
          )}
        </div>
      </div>
      <a
        href={`/t/${truck._id}`}
        className="truck-order-btn"
        onClick={(e) => e.stopPropagation()}
      >
        Pedir
      </a>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.18 23.76c.3.17.64.22.99.14l12.82-7.38-2.79-2.79-11.02 10.03zM.35 1.09C.13 1.43 0 1.88 0 2.44v19.12c0 .56.13 1.01.35 1.35l.07.07 10.7-10.7v-.25L.42 1.02.35 1.09zM20.96 10.8l-2.72-1.57-3.06 3.06 3.06 3.06 2.74-1.58c.78-.45.78-1.52-.02-1.97zM4.17.24l12.82 7.38-2.79 2.79L3.18.24C3.53.16 3.87.07 4.17.24z" />
    </svg>
  );
}

// ─── Dark Map Style ───────────────────────────────────────────────────────────

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8fa8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#38385a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4a4a6a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d0d1a" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e1e32" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a2a1a" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#232336" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3a3a5c" }] },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Nunito:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080810;
    --surface: #0f0f1a;
    --surface2: #16162a;
    --border: rgba(255,255,255,0.07);
    --orange: #FF6B35;
    --orange-dim: rgba(255,107,53,0.15);
    --green: #22C55E;
    --red: #EF4444;
    --text: #f0f0f8;
    --muted: rgba(240,240,248,0.45);
    --font-display: 'Syne', sans-serif;
    --font-body: 'Nunito', sans-serif;
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); overflow-x: hidden; }

  /* ── NAV ── */
  .nav {
    position: absolute; top: 0; left: 0; right: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon { font-size: 24px; }
  .logo-text { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
  .nav-actions { display: flex; gap: 12px; align-items: center; }
  .btn-ghost { color: var(--muted); font-size: 14px; text-decoration: none; padding: 8px 16px; border-radius: 8px; transition: color 0.2s; font-family: var(--font-body); }
  .btn-ghost:hover { color: var(--text); }
  .btn-primary-sm {
    background: var(--orange); color: #fff; font-size: 13px; font-weight: 700;
    padding: 9px 20px; border-radius: 10px; text-decoration: none; font-family: var(--font-body);
    transition: opacity 0.2s;
  }
  .btn-primary-sm:hover { opacity: 0.88; }

  /* ── HERO ── */
  .hero {
    position: relative; min-height: 100vh;
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 120px 40px 80px;
    overflow: hidden;
  }
  .hero-bg { position: absolute; inset: 0; z-index: 0; }
  .hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
  }
  .hero-glow {
    position: absolute; top: 20%; left: 10%;
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(255,107,53,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-content { position: relative; z-index: 1; max-width: 720px; }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--orange-dim); border: 1px solid rgba(255,107,53,0.25);
    border-radius: 100px; padding: 6px 16px; font-size: 13px;
    color: var(--orange); font-weight: 600; margin-bottom: 28px;
    animation: fadeUp 0.6s ease both;
  }
  .badge-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
    animation: pulse-dot 1.5s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.85); }
  }
  .hero-title {
    font-family: var(--font-display); font-size: clamp(52px, 7vw, 88px);
    font-weight: 900; line-height: 1.0; letter-spacing: -0.03em;
    margin-bottom: 24px; color: var(--text);
    animation: fadeUp 0.6s 0.1s ease both;
  }
  .hero-accent { color: var(--orange); }
  .hero-subtitle {
    font-size: 18px; color: var(--muted); line-height: 1.6;
    max-width: 520px; margin-bottom: 40px;
    animation: fadeUp 0.6s 0.2s ease both;
  }
  .hero-cta {
    display: flex; gap: 14px; flex-wrap: wrap; align-items: center;
    margin-bottom: 20px;
    animation: fadeUp 0.6s 0.3s ease both;
  }
  .btn-store {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px; padding: 12px 20px; text-decoration: none; color: var(--text);
    transition: background 0.2s, border-color 0.2s; min-width: 160px;
  }
  .btn-store:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
  .store-sub { display: block; font-size: 11px; color: var(--muted); }
  .store-main { display: block; font-size: 15px; font-weight: 700; }
  .btn-outline {
    padding: 12px 24px; border: 1px solid var(--border);
    border-radius: 14px; color: var(--muted); text-decoration: none;
    font-size: 14px; font-weight: 600; transition: color 0.2s, border-color 0.2s;
    font-family: var(--font-body);
  }
  .btn-outline:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
  .hero-alert-hint {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--muted);
    animation: fadeUp 0.6s 0.4s ease both;
  }
  .hint-icon { font-size: 16px; }
  .hero-scroll-hint {
    position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .scroll-line {
    width: 1px; height: 60px;
    background: linear-gradient(to bottom, var(--orange), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  @keyframes scrollPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── MAP SECTION ── */
  .map-section { padding: 80px 40px; }
  .section-header-row {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 28px;
  }
  .section-title { font-family: var(--font-display); font-size: 32px; font-weight: 800; margin-bottom: 6px; }
  .section-sub { font-size: 14px; color: var(--muted); }
  .truck-count { text-align: right; }
  .count-num { display: block; font-family: var(--font-display); font-size: 36px; font-weight: 900; color: var(--orange); }
  .count-label { font-size: 12px; color: var(--muted); }

  /* Filters */
  .filters-row {
    display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 24px;
    scrollbar-width: none;
  }
  .filters-row::-webkit-scrollbar { display: none; }
  .filter-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 100px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--muted); font-size: 13px; font-weight: 600;
    cursor: pointer; white-space: nowrap; transition: all 0.2s;
    font-family: var(--font-body);
  }
  .filter-btn:hover { border-color: rgba(255,255,255,0.18); color: var(--text); }
  .filter-btn.active {
    background: var(--orange-dim); border-color: rgba(255,107,53,0.35);
    color: var(--orange);
  }
  .filter-icon { font-size: 14px; }

  /* Map layout */
  .map-layout { display: grid; grid-template-columns: 1fr 380px; gap: 20px; height: 600px; }
  .map-container { position: relative; border-radius: 20px; overflow: hidden; border: 1px solid var(--border); }
  .map-canvas { width: 100%; height: 100%; }
  .map-loading {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 14px; background: var(--surface);
    color: var(--muted); font-size: 14px;
  }
  .map-spinner {
    width: 32px; height: 32px;
    border: 2px solid rgba(255,107,53,0.2);
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .map-legend {
    position: absolute; bottom: 14px; left: 14px;
    background: rgba(8,8,16,0.85); backdrop-filter: blur(8px);
    border: 1px solid var(--border); border-radius: 10px;
    padding: 8px 14px; font-size: 12px; color: var(--muted);
    display: flex; align-items: center; gap: 6px;
  }
  .legend-dot {
    width: 10px; height: 10px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.5);
  }
  .legend-dot.open { background: var(--green); }
  .legend-dot.closed { background: var(--red); }

  /* Truck list */
  .truck-list {
    overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: thin; scrollbar-color: var(--surface2) transparent;
  }
  .list-loading, .list-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%; gap: 12px;
    color: var(--muted); font-size: 14px; text-align: center;
  }
  .empty-icon { font-size: 36px; }
  .truck-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 14px; cursor: pointer;
    display: flex; gap: 12px; align-items: center;
    transition: border-color 0.2s, background 0.2s;
  }
  .truck-card:hover { border-color: rgba(255,107,53,0.25); background: var(--surface2); }
  .truck-card.selected { border-color: rgba(255,107,53,0.5); background: var(--orange-dim); }
  .truck-thumb {
    width: 56px; height: 56px; border-radius: 12px;
    object-fit: cover; flex-shrink: 0; background: var(--surface2);
  }
  .truck-info { flex: 1; min-width: 0; }
  .truck-name-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
  .truck-name { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .status-pill {
    font-size: 10px; font-weight: 700; border-radius: 100px;
    padding: 3px 9px; white-space: nowrap; flex-shrink: 0; margin-left: 6px;
  }
  .status-pill.open { background: rgba(34,197,94,0.15); color: var(--green); }
  .status-pill.closed { background: rgba(239,68,68,0.1); color: var(--red); }
  .truck-cuisine { font-size: 12px; color: var(--muted); display: block; margin-bottom: 6px; }
  .truck-meta { display: flex; gap: 10px; }
  .truck-rating, .truck-dist { font-size: 12px; color: var(--muted); }
  .truck-order-btn {
    background: var(--orange); color: #fff;
    border-radius: 10px; padding: 8px 14px;
    font-size: 12px; font-weight: 700; text-decoration: none;
    white-space: nowrap; flex-shrink: 0;
    transition: opacity 0.2s; font-family: var(--font-body);
  }
  .truck-order-btn:hover { opacity: 0.88; }

  /* ── APP SECTION ── */
  .app-section {
    padding: 80px 40px;
    background: var(--surface);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .app-inner { display: grid; grid-template-columns: 1fr auto; gap: 80px; align-items: center; max-width: 1100px; margin: 0 auto; }
  .app-eyebrow {
    display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--orange);
    border: 1px solid rgba(255,107,53,0.25); border-radius: 100px;
    padding: 4px 14px; margin-bottom: 20px;
  }
  .app-title {
    font-family: var(--font-display); font-size: clamp(36px, 4vw, 52px);
    font-weight: 900; line-height: 1.05; letter-spacing: -0.02em;
    margin-bottom: 20px;
  }
  .app-body { font-size: 16px; color: var(--muted); line-height: 1.7; margin-bottom: 32px; max-width: 460px; }
  .app-body strong { color: var(--text); }
  .app-perks { display: flex; flex-direction: column; gap: 16px; margin-bottom: 36px; }
  .perk-row { display: flex; align-items: flex-start; gap: 14px; }
  .perk-icon { font-size: 22px; margin-top: 2px; flex-shrink: 0; }
  .perk-title { font-size: 14px; font-weight: 700; margin-bottom: 2px; }
  .perk-desc { font-size: 13px; color: var(--muted); }
  .store-buttons { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn-store-dark {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; padding: 12px 20px; text-decoration: none; color: var(--text);
    transition: background 0.2s; min-width: 150px;
  }
  .btn-store-dark:hover { background: rgba(255,255,255,0.09); }

  /* Phone mockup */
  .phone-mockup { position: relative; flex-shrink: 0; }
  .phone-frame {
    width: 260px; background: #0a0a14;
    border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 36px; padding: 14px;
    box-shadow: 0 0 60px rgba(255,107,53,0.1);
    position: relative; z-index: 1;
  }
  .phone-notch {
    width: 80px; height: 24px; background: #0a0a14;
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 100px; margin: 0 auto 12px;
  }
  .phone-screen { background: #0d0d18; border-radius: 24px; padding: 12px; overflow: hidden; }
  .phone-status-bar {
    display: flex; justify-content: space-between;
    font-size: 11px; color: rgba(255,255,255,0.4);
    margin-bottom: 12px; padding: 0 4px;
  }
  .phone-alert {
    background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
    border-radius: 14px; padding: 12px; margin-bottom: 12px;
    display: flex; gap: 10px; align-items: flex-start;
    animation: alertBounce 2s ease-in-out infinite;
  }
  @keyframes alertBounce { 0%,100% { transform: scale(1); } 5% { transform: scale(1.02); } 10% { transform: scale(1); } }
  .alert-icon { font-size: 22px; }
  .alert-app { font-size: 10px; color: rgba(255,255,255,0.4); margin-bottom: 2px; }
  .alert-title { font-size: 13px; font-weight: 700; color: var(--green); margin-bottom: 2px; }
  .alert-body { font-size: 11px; color: rgba(255,255,255,0.5); }
  .phone-order-card {
    background: #14141f; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px; padding: 12px; margin-bottom: 10px;
  }
  .order-header-phone { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .order-id { font-size: 12px; color: rgba(255,255,255,0.4); }
  .order-ready { font-size: 12px; color: var(--green); font-weight: 700; }
  .order-items-phone { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 12px; line-height: 1.8; }
  .order-progress { display: flex; justify-content: space-between; }
  .progress-step { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .step-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: rgba(255,255,255,0.12);
  }
  .progress-step.done .step-dot { background: var(--orange); }
  .progress-step span { font-size: 9px; color: rgba(255,255,255,0.3); }
  .progress-step.done span { color: var(--orange); }
  .phone-vibrate-hint {
    text-align: center; font-size: 11px; color: rgba(255,255,255,0.3);
    padding: 8px 0 4px;
  }
  .phone-glow {
    position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
    width: 200px; height: 80px;
    background: radial-gradient(ellipse, rgba(255,107,53,0.3) 0%, transparent 70%);
    filter: blur(20px);
  }

  /* ── OWNER SECTION ── */
  .owner-section { padding: 80px 40px; text-align: center; }
  .owner-inner { max-width: 620px; margin: 0 auto; }
  .owner-emoji { font-size: 48px; display: block; margin-bottom: 20px; }
  .owner-title { font-family: var(--font-display); font-size: clamp(28px, 4vw, 40px); font-weight: 900; margin-bottom: 16px; }
  .owner-body { font-size: 16px; color: var(--muted); line-height: 1.7; margin-bottom: 28px; }
  .owner-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn-owner { display: inline-block; background: var(--orange); color: #fff; padding: 16px 32px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; transition: opacity 0.2s; font-family: var(--font-body); box-shadow: 0 8px 32px rgba(255,107,53,0.35); }
  .btn-owner:hover { opacity: 0.88; }
  .btn-owner-ghost { display: inline-block; background: transparent; color: var(--muted); padding: 16px 32px; border-radius: 14px; font-size: 15px; font-weight: 600; text-decoration: none; border: 1px solid var(--border); transition: color 0.2s, border-color 0.2s; font-family: var(--font-body); }
  .btn-owner-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
  /* Pricing teaser */
  .pricing-teaser { background: var(--surface); border: 1px solid rgba(255,107,53,0.18); border-radius: 20px; padding: 24px; margin-bottom: 28px; display: flex; gap: 24px; align-items: flex-start; flex-wrap: wrap; text-align: left; }
  .pricing-teaser-left { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }
  .pricing-free-badge { display: flex; flex-direction: column; align-items: center; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); border-radius: 14px; padding: 10px 14px; }
  .pricing-free-n { font-family: var(--font-display); font-size: 28px; font-weight: 900; color: #22C55E; line-height: 1; }
  .pricing-free-l { font-size: 10px; font-weight: 700; color: #22C55E; text-transform: uppercase; letter-spacing: 0.05em; }
  .pricing-price { font-family: var(--font-display); font-size: 28px; font-weight: 900; line-height: 1; }
  .pricing-mo { font-size: 14px; color: var(--muted); font-weight: 600; }
  .pricing-note { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .pricing-highlights { display: flex; flex-direction: column; gap: 7px; flex: 1; }
  .pricing-hl { font-size: 13px; color: var(--muted); font-weight: 500; }

  /* ── FOOTER ── */
  .footer { padding: 40px; border-top: 1px solid var(--border); }
  .footer-inner { display: flex; flex-direction: column; align-items: center; gap: 16px; }
  .footer-logo { display: flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 700; font-size: 16px; }
  .footer-links { display: flex; gap: 24px; }
  .footer-links a { font-size: 13px; color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .footer-links a:hover { color: var(--text); }
  .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .nav { padding: 16px 20px; }
    .hero { padding: 100px 20px 60px; }
    .map-section { padding: 60px 20px; }
    .map-layout { grid-template-columns: 1fr; height: auto; }
    .map-container { height: 360px; }
    .truck-list { height: 360px; }
    .app-section { padding: 60px 20px; }
    .app-inner { grid-template-columns: 1fr; gap: 40px; }
    .phone-mockup { display: none; }
    .owner-section { padding: 60px 20px; }
    .section-header-row { flex-direction: column; gap: 12px; }
  }
  @media (max-width: 600px) {
    .hero-cta { flex-direction: column; align-items: flex-start; }
    .btn-store { width: 100%; }
    .store-buttons { flex-direction: column; }
    .btn-store-dark { width: 100%; }
    .nav-actions .btn-ghost { display: none; }
  }
`;

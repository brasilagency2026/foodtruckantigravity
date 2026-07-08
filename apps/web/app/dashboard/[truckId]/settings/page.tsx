"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

const CUISINE_OPTIONS = [
  "Hambúrgueres", "Tacos & Mexicano", "Pizza", "Japonês / Sushi",
  "Árabe / Esfiha", "Churrasco", "Frutos do Mar", "Vegano",
  "Sorvetes & Açaí", "Bebidas & Drinks",
];

const DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
] as const;

export default function SettingsPage({ params }: { params: { truckId: string } }) {
  const truckId = params.truckId as Id<"foodTrucks">;
  const truck = useQuery(api.foodTrucks.getTruckById, { truckId });
  const updateTruck = useMutation(api.foodTrucks.updateTruck);
  const disconnectMP = useMutation(api.foodTrucks.disconnectMercadoPago);
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coverPhotoUrl, setCoverPhotoUrl] = useState("");
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string } | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (truck) {
      setName(truck.name);
      setDescription(truck.description);
      setCuisine(truck.cuisine);
      setPhone(truck.phone);
      setAddress(truck.address);
      setCoverPhotoUrl(truck.coverPhotoUrl);
      setOpeningHours((truck.openingHours as any) ?? {});
      setLatitude(truck.latitude);
      setLongitude(truck.longitude);
    }
  }, [truck]);

  const searchAddress = async () => {
    if (!address.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
      );
      const json = await res.json();
      if (json.results && json.results[0]) {
        const loc = json.results[0].geometry.location;
        setLatitude(loc.lat);
        setLongitude(loc.lng);
        setAddress(json.results[0].formatted_address);
      } else {
        setError("Endereço não encontrado.");
      }
    } catch {
      setError("Erro ao buscar endereço.");
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateTruck({
        truckId,
        name,
        description,
        cuisine,
        phone,
        address,
        coverPhotoUrl,
        openingHours,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError("Erro ao salvar. Tente novamente.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const key = `trucks/${truckId}/cover-${Date.now()}.${ext}`;
      
      // 1. Get signed URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType: file.type }),
      });
      
      if (!res.ok) throw new Error("Falha ao obter URL de upload");
      
      const { uploadUrl, publicUrl } = await res.json();
      
      // 2. Upload to R2/S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });
      
      if (!uploadRes.ok) throw new Error("Falha no upload para o storage");

      setCoverPhotoUrl(publicUrl);
    } catch (e) {
      console.error("Upload error:", e);
      setError("Erro ao carregar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const updateHours = (day: string, field: "open" | "close", value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { open: prev[day]?.open ?? "08:00", close: prev[day]?.close ?? "18:00", [field]: value },
    }));
  };

  const toggleDay = (day: string) => {
    setOpeningHours((prev) => {
      if (prev[day]) {
        const copy = { ...prev };
        delete copy[day];
        return copy;
      }
      return { ...prev, [day]: { open: "08:00", close: "18:00" } };
    });
  };

  if (!truck) {
    return (
      <div style={s.loading}>
        <div style={s.spinner} />
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <a href={`/dashboard/${params.truckId}`} style={s.backBtn}>← Voltar</a>
        <h1 style={s.title}>Configurações</h1>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {saved && <div style={s.success}>✅ Salvo com sucesso!</div>}

      {/* Info */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Informações do truck</h2>

        <label style={s.label}>Nome</label>
        <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} />

        <label style={s.label}>Descrição</label>
        <textarea style={{ ...s.input, minHeight: 80, resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} />

        <label style={s.label}>Tipo de cozinha</label>
        <select style={s.input} value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
          {CUISINE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={s.label}>Telefone / WhatsApp</label>
        <input style={s.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+55 11 99999-9999" />
      </section>

      {/* Photo */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Foto de capa</h2>
        {coverPhotoUrl && (
          <img src={coverPhotoUrl} alt="Capa" style={s.coverPreview} />
        )}
        <label style={s.uploadBtn}>
          {uploading ? "Enviando..." : "📸 Trocar foto"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
            disabled={uploading}
          />
        </label>
      </section>

      {/* Address */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Endereço</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input 
            style={s.input} 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Digite o endereço (Ex: Rua Augusta, 1000, São Paulo)" 
            onKeyDown={(e) => e.key === "Enter" && searchAddress()}
          />
          <button 
            type="button"
            onClick={searchAddress}
            disabled={searching}
            style={{
              padding: "14px 20px",
              background: "#FF6B35",
              border: "none",
              borderRadius: 12,
              color: "#FFF",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {searching ? "Buscando..." : "Buscar"}
          </button>
        </div>
        
        {latitude && longitude && (
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=520x200&scale=2&markers=color:0xFF6B35|${latitude},${longitude}&style=element:geometry|color:0x1a1a1a&style=element:labels.text.fill|color:0x757575&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`}
              alt="Localização no mapa"
              style={{ width: "100%", display: "block", borderRadius: 16 }}
            />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)", fontSize: 28 }}>📍</div>
          </div>
        )}
      </section>

      {/* Hours */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Horários de funcionamento</h2>
        {DAYS.map(({ key, label }) => (
          <div key={key} style={s.dayRow}>
            <label style={s.dayLabel}>
              <input
                type="checkbox"
                checked={!!openingHours[key]}
                onChange={() => toggleDay(key)}
                style={{ marginRight: 8 }}
              />
              {label}
            </label>
            {openingHours[key] && (
              <div style={s.hoursInputs}>
                <input
                  type="time"
                  value={openingHours[key]!.open}
                  onChange={(e) => updateHours(key, "open", e.target.value)}
                  style={s.timeInput}
                />
                <span style={{ color: "rgba(255,255,255,0.3)" }}>até</span>
                <input
                  type="time"
                  value={openingHours[key]!.close}
                  onChange={(e) => updateHours(key, "close", e.target.value)}
                  style={s.timeInput}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Mercado Pago */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>💳 Mercado Pago</h2>
        {truck.mpAccessToken ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ color: "#22C55E", fontWeight: 700, fontSize: 14 }}>✅ Conectado</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                (ID: {truck.mpUserId})
              </span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
              100% dos pagamentos vão direto para sua conta Mercado Pago. Sem comissão da plataforma.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href={`/api/mercadopago/authorize?truckId=${params.truckId}`}
                style={{ ...s.uploadBtn, textDecoration: "none" }}
              >
                🔄 Reconectar
              </a>
              <button
                onClick={async () => {
                  if (confirm("Desconectar o Mercado Pago? Você não poderá aceitar pagamentos online.")) {
                    await disconnectMP({ truckId });
                  }
                }}
                style={{ ...s.uploadBtn, background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
              >
                Desconectar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>
              Conecte sua conta Mercado Pago para aceitar Pix, crédito e débito. 100% do pagamento vai para você!
            </p>
            <a
              href={`/api/mercadopago/authorize?truckId=${params.truckId}`}
              style={{ display: "inline-block", padding: "12px 24px", background: "#009EE3", color: "#FFF", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            >
              Conectar Mercado Pago →
            </a>
          </div>
        )}
      </section>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} style={{ ...s.saveBtn, opacity: saving ? 0.5 : 1 }}>
        {saving ? "Salvando..." : "💾 Salvar alterações"}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loading: {
    minHeight: "100vh", background: "#0D0D0D",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  spinner: {
    width: 32, height: 32,
    border: "3px solid rgba(255,107,53,0.2)",
    borderTop: "3px solid #FF6B35",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  page: {
    minHeight: "100vh", background: "#0D0D0D",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: "32px 24px 80px", maxWidth: 600, margin: "0 auto",
  },
  header: { marginBottom: 28 },
  backBtn: {
    display: "inline-block", color: "#FF6B35", textDecoration: "none",
    fontSize: 14, fontWeight: 600, marginBottom: 12, fontFamily: "inherit",
  },
  title: { color: "#FFF", fontSize: 24, fontWeight: 800, margin: 0 },
  error: {
    background: "rgba(239,68,68,0.1)", color: "#EF4444",
    padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 14, textAlign: "center",
  },
  success: {
    background: "rgba(34,197,94,0.1)", color: "#22C55E",
    padding: 12, borderRadius: 10, marginBottom: 20, fontSize: 14, textAlign: "center",
  },
  section: {
    background: "#1A1A1A", borderRadius: 16,
    padding: 24, marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: 700, margin: "0 0 16px" },
  label: {
    display: "block", color: "rgba(255,255,255,0.6)",
    fontSize: 13, fontWeight: 500, marginBottom: 6, marginTop: 14,
  },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)", color: "#fff",
    fontSize: 14, outline: "none", boxSizing: "border-box" as const,
    fontFamily: "inherit",
  },
  coverPreview: {
    width: "100%", height: 160, objectFit: "cover",
    borderRadius: 12, marginBottom: 12,
  },
  uploadBtn: {
    display: "inline-block", padding: "10px 18px",
    background: "rgba(255,107,53,0.15)", color: "#FF6B35",
    borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  dayRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    flexWrap: "wrap" as const, gap: 8,
  },
  dayLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14, display: "flex", alignItems: "center" },
  hoursInputs: { display: "flex", alignItems: "center", gap: 8 },
  timeInput: {
    padding: "6px 10px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)", color: "#fff",
    fontSize: 14, outline: "none", fontFamily: "inherit",
  },
  saveBtn: {
    width: "100%", padding: 16, borderRadius: 12,
    border: "none", background: "#FF6B35", color: "#fff",
    fontWeight: 700, fontSize: 16, cursor: "pointer",
    fontFamily: "inherit", position: "sticky" as const, bottom: 20,
  },
};

import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { getStateDisplay } from "shared/utils/slug";

interface PageProps {
  params: { state: string; city: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const trucks = await fetchQuery(api.foodTrucks.getTrucksByCity, params);
  const city = trucks[0]?.cityDisplay ?? params.city;
  const state = trucks[0]?.stateDisplay ?? params.state.toUpperCase();
  return {
    title: `Food Trucks em ${city}, ${state} — Cardápios e Pedidos Online`,
    description: `Descubra ${trucks.length} food trucks em ${city}. Veja cardápios e peça online com alerta sonoro quando seu pedido ficar pronto.`,
  };
}

export default async function CityPage({ params }: PageProps) {
  const trucks = await fetchQuery(api.foodTrucks.getTrucksByCity, params);
  const cityDisplay = trucks[0]?.cityDisplay ?? params.city;
  const stateDisplay = trucks[0]?.stateDisplay ?? params.state.toUpperCase();

  return (
    <main style={{ minHeight: "100vh", background: "#080810", color: "#f0f0f8", fontFamily: "'Nunito', sans-serif", padding: "40px 24px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Nunito:wght@400;600;700&display=swap');`}</style>

      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Início</Link>
        {" / "}
        <Link href={`/menu/${params.state}`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{stateDisplay}</Link>
        {" / "}
        <span style={{ color: "#FF6B35" }}>{cityDisplay}</span>
      </nav>

      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, marginBottom: 8 }}>
        Food trucks em {cityDisplay}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, marginBottom: 36 }}>
        {trucks.length} truck{trucks.length !== 1 ? "s" : ""} encontrado{trucks.length !== 1 ? "s" : ""}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, maxWidth: 1000, margin: "0 auto" }}>
        {trucks.map((truck) => (
          <Link
            key={truck._id}
            href={`/menu/${truck.state}/${truck.city}/${truck.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", transition: "border-color 0.2s" }}>
              {truck.coverPhotoUrl && (
                <img src={truck.coverPhotoUrl} alt={truck.name} style={{ width: "100%", height: 140, objectFit: "cover" }} />
              )}
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800 }}>{truck.name}</h2>
                  <span style={{
                    fontSize: 11, fontWeight: 700, borderRadius: 100, padding: "3px 9px",
                    background: truck.isOpen ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
                    color: truck.isOpen ? "#22C55E" : "#EF4444",
                  }}>
                    {truck.isOpen ? "Aberto" : "Fechado"}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#FF6B35", fontWeight: 600, marginBottom: 8 }}>{truck.cuisine}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, lineHeight: 1.5 }}>
                  {truck.description.slice(0, 80)}...
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ background: "#FF6B35", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, marginLeft: "auto" }}>
                    Ver cardápio →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

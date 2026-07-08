"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// ============================================
// 1. PAGE D'ONBOARDING PRINCIPALE
// ============================================

export default function OnboardingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  
  // Requêtes Convex pour vérifier le statut de l'utilisateur
  const partnerDashboard = useQuery(api.admin.getPartnerDashboard);
  const myTrucks = useQuery(api.foodTrucks.getMyTrucks);
  const createTruck = useMutation(api.foodTrucks.createTruck);

  const [voucherCode, setVoucherCode] = useState<string>("");

  // Lire le voucher à l'initialisation
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const v = url.searchParams.get("voucher");
      if (v) {
        setVoucherCode(v.trim().toUpperCase());
      }
    }
  }, []);

  // Redirection automatique des utilisateurs non connectés vers le Sign Up
  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      const url = new URL(window.location.href);
      const v = url.searchParams.get("voucher");
      router.replace(v ? `/sign-up?voucher=${encodeURIComponent(v)}` : "/sign-up");
    }
  }, [clerkLoaded, isSignedIn, router]);

  // Redirection des commerciaux vers leur dashboard
  useEffect(() => {
    if (!isSignedIn) return;

    if (partnerDashboard !== undefined && partnerDashboard !== null) {
      router.replace("/comercial/dashboard");
      return;
    }

    if (myTrucks && myTrucks.length > 0) {
      router.replace(`/dashboard/${myTrucks[0]._id}`);
    }
  }, [partnerDashboard, myTrucks, router, isSignedIn]);

  // Bloquer le rendu et afficher un écran neutre de chargement/redirection
  if (!clerkLoaded || partnerDashboard === undefined || myTrucks === undefined || !isSignedIn) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0D0D0D", color: "#FFF" }}>
        <p>Redirecionando...</p>
      </div>
    );
  }

  // Rendu de la première étape du formulaire en lui transmettant le voucher
  return (
    <StepInfo 
      voucherCode={voucherCode} 
      onNext={async (data) => {
        const truckId = await createTruck({
          ...data,
          voucherCode: voucherCode || undefined, // Transmission du voucher pour persistance Convex
        });
        router.push(`/dashboard/${truckId}/assinatura`);
      }}
    />
  );
}

// ============================================
// 2. ÉTAPE DE FORMULAIRE : StepInfo
// ============================================

function StepInfo({ voucherCode, onNext }: { voucherCode?: string; onNext: (data: any) => void }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onNext({ name: "Truck name" }); }}>
      <h3>Informações do Food Truck</h3>
      
      {/* Affichage verrouillé du voucher commercial si présent dans le lien d'affiliation */}
      {voucherCode && (
        <div style={{ marginTop: 15 }}>
          <label style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 8 }}>
            Código do Voucher (Comercial)
          </label>
          <input
            type="text"
            value={voucherCode}
            readOnly
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#1A1A1A",
              border: "1px solid rgba(255,107,53,0.3)",
              borderRadius: 12,
              color: "#FF6B35",
              fontWeight: "bold",
              cursor: "not-allowed",
              opacity: 0.6
            }}
          />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "block", marginTop: 6 }}>
            Este voucher comercial foi aplicado através do link e garante seus descontos/comissões. Não é possível modificá-lo.
          </span>
        </div>
      )}

      <button type="submit" style={{ marginTop: 20 }}>Avançar</button>
    </form>
  );
}

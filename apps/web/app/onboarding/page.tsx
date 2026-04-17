"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StepInfo } from "./StepInfo";
import { StepLocation } from "./StepLocation";
import { StepPhoto } from "./StepPhoto";
import { StepHours } from "./StepHours";
import { StepPayment } from "./StepPayment";

export type OnboardingData = {
  name: string; description: string; cuisine: string; phone: string;
  slug: string; state: string; city: string; cityDisplay: string; stateDisplay: string;
  latitude: number; longitude: number; address: string;
  coverPhotoUrl: string;
  openingHours: {
    monday?: { open: string; close: string }; tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string }; thursday?: { open: string; close: string };
    friday?: { open: string; close: string }; saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };
};

const STEPS = [
  { label: "Seu truck", icon: "🍔" }, { label: "Localização", icon: "📍" },
  { label: "Foto", icon: "📸" }, { label: "Horários", icon: "🕐" },
  { label: "Pagamento", icon: "💳" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const createTruck = useMutation(api.foodTrucks.createTruck);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  
  function update(fields: Partial<OnboardingData>) { setData((p) => ({ ...p, ...fields })); }
  
  async function finish() {
    if (!isAuthenticated || !userId) {
      alert("Você precisa estar logado para cadastrar um truck.");
      return;
    }
    setLoading(true);
    try {
      const truckId = await createTruck({
        name: data.name!, description: data.description!, cuisine: data.cuisine!,
        phone: data.phone!, latitude: data.latitude!, longitude: data.longitude!,
        address: data.address!, coverPhotoUrl: data.coverPhotoUrl!, openingHours: data.openingHours ?? {},
        ownerId: userId, slug: data.slug!, state: data.state!, city: data.city!,
        cityDisplay: data.cityDisplay!, stateDisplay: data.stateDisplay!,
      });
      router.push(`/dashboard/${truckId}`);
    } catch (e) { 
      console.error(e);
      setLoading(false); 
    }
  }

  if (!isAuthenticated) {
     return (
       <div style={{ minHeight:"100vh", background:"#0D0D0D", color:"#FFF", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20 }}>
         <h1>Acesso Restrito</h1>
         <p>Por favor, faça login para continuar.</p>
         <button onClick={() => router.push("/auth")} style={{ background:"#FF6B35", color:"#FFF", border:"none", padding:"10px 20px", borderRadius:8, cursor:"pointer" }}>
            Ir para Login
         </button>
       </div>
     );
  }

  return (
    <div style={{ minHeight:"100vh",background:"#0D0D0D",fontFamily:"'Nunito',system-ui,sans-serif",display:"flex",flexDirection:"column" }}>
      <div style={{ height:3,background:"rgba(255,255,255,0.06)" }}>
        <div style={{ height:"100%",background:"#FF6B35",transition:"width 0.4s ease",width:`${((step+1)/STEPS.length)*100}%` }} />
      </div>
      <div style={{ display:"flex",justifyContent:"center",gap:8,padding:"24px 20px 0",overflowX:"auto" }}>
        {STEPS.map((st,i) => (
          <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:56 }}>
            <div style={{ width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<step?14:16,fontWeight:700,transition:"all 0.3s",
              background:i<step?"#FF6B35":i===step?"rgba(255,107,53,0.15)":"rgba(255,255,255,0.05)",
              border:i===step?"2px solid #FF6B35":i<step?"2px solid #FF6B35":"1px solid rgba(255,255,255,0.1)",
              color:i<step?"#FFF":i===step?"#FF6B35":"rgba(255,255,255,0.3)" }}>
              {i < step ? "✓" : st.icon}
            </div>
            <span style={{ fontSize:11,whiteSpace:"nowrap",fontWeight:500,color:i===step?"#FF6B35":"rgba(255,255,255,0.25)" }}>{st.label}</span>
          </div>
        ))}
      </div>
      <div style={{ flex:1,padding:"32px 24px 48px",maxWidth:520,margin:"0 auto",width:"100%" }}>
        {step===0 && <StepInfo data={data} onNext={(f)=>{update(f);setStep(1);}} />}
        {step===1 && <StepLocation data={data} onBack={()=>setStep(0)} onNext={(f)=>{update(f);setStep(2);}} />}
        {step===2 && <StepPhoto data={data} onBack={()=>setStep(1)} onNext={(f)=>{update(f);setStep(3);}} />}
        {step===3 && <StepHours data={data} onBack={()=>setStep(2)} onNext={(f)=>{update(f);setStep(4);}} />}
        {step===4 && <StepPayment onBack={()=>setStep(3)} onFinish={finish} loading={loading} />}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Nunito:wght@400;500;600;700&display=swap');*{box-sizing:border-box;}`}</style>
    </div>
  );
}


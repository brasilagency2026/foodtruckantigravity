"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function AssinaturaPage() {
  const params = useParams();
  const truckId = params.truckId as string;

  // We should ideally fetch truck info here to show current plan status
  // const truck = useQuery(api.foodTrucks.getTruckById, { truckId });

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"cc" | "pix">("cc");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherStatus, setVoucherStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [discount, setDiscount] = useState(0); // e.g., 10 for 10%

  const plans = {
    monthly: { name: "Mensal", price: 199.90 },
    annual: { name: "Anual", price: 1920.00 } // 20% off from monthly
  };

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    setVoucherStatus("validating");
    // Simulate API call to check voucher (to be implemented in Convex)
    setTimeout(() => {
      if (voucherCode.toUpperCase() === "CARLOS10" || voucherCode.length >= 5) {
        setVoucherStatus("valid");
        setDiscount(10);
      } else {
        setVoucherStatus("invalid");
        setDiscount(0);
      }
    }, 1000);
  };

  const calculateTotal = () => {
    const basePrice = plans[selectedPlan].price;
    return basePrice - (basePrice * (discount / 100));
  };

  const handleCheckout = async () => {
    // This will call the Convex mutation / Next.js backend to generate the MercadoPago preference or preapproval link.
    const checkoutData = {
      truckId,
      plan: selectedPlan,
      method: paymentMethod,
      voucher: voucherStatus === "valid" ? voucherCode : null,
      total: calculateTotal()
    };

    console.log("Proceeding to checkout with:", checkoutData);
    alert("Redirecionando para Mercado Pago... (Em breve)");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white bg-[#0f0f1a] min-h-screen">
      <h1 className="text-3xl font-bold text-[#FF6B35] mb-2 font-syne">Meu Plano de Assinatura</h1>
      <p className="text-gray-400 mb-8">Gerencie seu acesso à plataforma Food Pronto.</p>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Left Col: Plan Selection */}
        <div className="space-y-6">
          <div className="bg-[#16162a] p-6 rounded-xl border border-white/5 shadow-lg">
            <h2 className="text-xl font-bold mb-4">1. Escolha seu Plano</h2>
            
            <div className="space-y-4">
              <label className={\`block p-4 rounded-lg border-2 cursor-pointer transition-colors \${selectedPlan === "monthly" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}\`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="plan" checked={selectedPlan === "monthly"} onChange={() => setSelectedPlan("monthly")} className="w-5 h-5 accent-[#FF6B35]"/>
                    <span className="font-bold text-lg">Plano Mensal</span>
                  </div>
                  <span className="text-xl font-bold">R$ 199,90</span>
                </div>
              </label>

              <label className={\`block p-4 rounded-lg border-2 cursor-pointer transition-colors \${selectedPlan === "annual" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}\`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="plan" checked={selectedPlan === "annual"} onChange={() => setSelectedPlan("annual")} className="w-5 h-5 accent-[#FF6B35]"/>
                    <span className="font-bold text-lg">Plano Anual</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">R$ 1.920,00</span><br/>
                    <span className="text-xs text-green-400">Equivale a R$ 160/mês (20% OFF)</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-[#16162a] p-6 rounded-xl border border-white/5 shadow-lg">
            <h2 className="text-xl font-bold mb-4">2. Forma de Pagamento</h2>
            
            <div className="space-y-4">
              {selectedPlan === "monthly" && (
                <label className={\`block p-4 rounded-lg border-2 cursor-pointer transition-colors \${paymentMethod === "cc" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}\`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="method" checked={paymentMethod === "cc"} onChange={() => setPaymentMethod("cc")} className="w-5 h-5 accent-[#FF6B35]"/>
                    <div>
                      <span className="font-bold text-lg block">Cartão de Crédito</span>
                      <span className="text-sm text-gray-400">Renovação automática todo mês. Sem preocupações.</span>
                    </div>
                  </div>
                </label>
              )}

              <label className={\`block p-4 rounded-lg border-2 cursor-pointer transition-colors \${paymentMethod === "pix" ? "border-[#FF6B35] bg-[#FF6B35]/10" : "border-white/10 hover:border-white/20"}\`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="method" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} className="w-5 h-5 accent-[#FF6B35]"/>
                  <div>
                    <span className="font-bold text-lg block">PIX</span>
                    <span className="text-sm text-gray-400">
                      {selectedPlan === "monthly" 
                        ? "Renovação manual. Enviaremos um lembrete todo mês para você gerar o PIX." 
                        : "Pagamento único anual."}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Checkout */}
        <div className="space-y-6">
          <div className="bg-[#16162a] p-6 rounded-xl border border-white/5 shadow-lg sticky top-6">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            
            <div className="flex justify-between text-gray-300 mb-2">
              <span>{plans[selectedPlan].name}</span>
              <span>R$ {plans[selectedPlan].price.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="my-6">
              <label className="block text-sm text-gray-400 mb-2">Código do Parceiro (Voucher)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    setVoucherStatus("idle");
                    setDiscount(0);
                  }}
                  placeholder="Ex: CARLOS10"
                  className="bg-[#0f0f1a] border border-white/20 rounded-lg px-4 py-2 w-full text-white uppercase"
                />
                <button 
                  onClick={handleApplyVoucher}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  {voucherStatus === "validating" ? "..." : "Aplicar"}
                </button>
              </div>
              {voucherStatus === "valid" && <p className="text-green-400 text-sm mt-2">✅ Cupom aplicado! 10% de desconto.</p>}
              {voucherStatus === "invalid" && <p className="text-red-400 text-sm mt-2">❌ Cupom inválido.</p>}
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-400 font-bold mb-4 border-b border-white/10 pb-4">
                <span>Desconto ({discount}%)</span>
                <span>- R$ {(plans[selectedPlan].price * (discount/100)).toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between items-end mb-8 mt-4 pt-4 border-t border-white/10">
              <span className="text-lg font-bold">Total a Pagar</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#FF6B35]">R$ {calculateTotal().toFixed(2).replace('.', ',')}</span>
                <span className="block text-xs text-gray-400">
                  {selectedPlan === "monthly" && paymentMethod === "cc" ? "Cobrado mensalmente" : ""}
                  {selectedPlan === "monthly" && paymentMethod === "pix" ? "Válido por 30 dias" : ""}
                  {selectedPlan === "annual" ? "Válido por 365 dias" : ""}
                </span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-[#FF6B35] hover:bg-[#e05a2b] text-white font-bold py-4 rounded-xl text-lg transition-transform hover:scale-[1.02] shadow-lg shadow-[#FF6B35]/20 flex items-center justify-center gap-2"
            >
              🔒 Pagar com Mercado Pago
            </button>
            <div className="text-center mt-4 text-xs text-gray-500">
              Pagamento 100% seguro.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
